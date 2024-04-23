import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {

  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  console.log(users);
  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author?.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
  
}

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  /* create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          id: 5,
          authorId: '8',
          content:'hello'
        },
      });
    }),
    */
      getById: publicProcedure.input(z.object({id: z.string()})).query(async ({ctx, input}) => {

        const temp: number = +input.id
        const post = await ctx.db.post.findUnique({where:{id: temp}})
        
        if(!post) throw new TRPCError({code: "NOT_FOUND"})

        return ( await addUserDataToPosts([post]))[0]
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    return addUserDataToPosts(posts)

  }),
    infinitePosts: publicProcedure
                    .input(
                      z.object({ 
                        limit: z.number().min(1).max(5).nullish(), 
                        cursor: z.number().nullish(),
                      }))
                      .query( async ({ctx, input}) => {
                        const limit = input.limit ?? 10
                        const {cursor} = input
                        const items = await ctx.db.post.findMany({
                          take: limit + 1,
                          cursor: cursor ? { id: cursor } : undefined
                          ,
                          orderBy: [
                            {
                              id: "desc",
                            },
                          ],
                        })
                        let nextCursor: typeof cursor | undefined = undefined
                        if(items.length > limit) {
                          const nextItem = items.pop()
                          nextCursor = nextItem!.id
                        }
                        
                        const posts = await addUserDataToPosts(items)

                        return {
                          posts,
                          nextCursor
                        }
                      })
  ,
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.post.findMany({
        where: { authorId: input.userId },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      }).then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(280),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
