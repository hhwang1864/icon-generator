import { TRPCError } from "@trpc/server";
import { env } from "~/env.mjs";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { b64Image } from "~/data/b64Image";

import AWS from "aws-sdk"

const s3 = new AWS.S3({
  credentials:{
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY
  },
  region:"ap-southeast-2"

})

const BUCKET_NAME = "hojin-icon-generator"
const configuration = new Configuration({
  apiKey: env.DALLE_API_KEY
});
const openai = new OpenAIApi(configuration);


async function generateIcon(prompt: string): Promise<string | undefined> {
  if (env.MOCK_DALLE === 'true') {
    return b64Image
  } else {
    const response = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json"
    })

    return response.data.data[0]?.b64_json
  }
}


export const generateRouter = createTRPCRouter({
  generateIcon: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        color: z.string()
      })
     )

    .mutation(async ({ ctx, input }) => {
      // Todo: verify the user has enough credit
      const {count} = await ctx.prisma.user.updateMany({
        where: {
          id: ctx.session.user.id,
          credits: {
            gte: 1
          },
        },
        data: {
          credits: {
            decrement: 1
          }
        }
      })
      if ( count <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "you do not have enough credits"
        })
      }
      const finalPrompt = `a modern icon in ${input.color} of a ${input.prompt}, pixel style minialistic, dark background`
      const b64EncodedImage = await generateIcon(finalPrompt)

      const icon = await ctx.prisma.icon.create({
        data: {
          prompt: input.prompt,
          userId: ctx.session.user.id
        }
      })

      // Buffer is temporary placeholder (variables in many programming languages) in memory (ram/disk) on which data can be dumped and then processing can be done.
      await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Body: Buffer.from(b64EncodedImage!, "base64" ),
        Key: icon.id, //TODO: generate a random ID
        ContentEncoding: "base64",
        ContentType: "image/png"
      }).promise()

    return {
        imageUrl: `https://${BUCKET_NAME}.s3.ap-southeast-2.amazonaws.com/${icon.id}`
      }
    })
});
