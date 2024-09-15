/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import {
  getBulkReactionByUser,
  getSortedChannelsByReactions,
  lum0x,
} from "./lum0x";
import { appURL } from "../utils";

const frameHandler = lum0x(async (ctx) => {
  const message = ctx.message;
  const state = ctx.state;

  const fid = message?.inputText
    ? (state.targetFid = message.inputText)
    : state.targetFid;

  const executedFid = message
    ? (state.executedFid = message.requesterFid.toString())
    : state.executedFid;

  const excute = async (targetFid: string) => {
    if (targetFid) {
      const data = await getBulkReactionByUser(targetFid, 200);
      state.data = data;

      const sortedChannels = getSortedChannelsByReactions();
      state.sortedChannels = sortedChannels;
    }
  };

  if (message?.inputText) {
    await excute(fid);
  }

  return {
    image: !fid ? (
      `${appURL()}/lum0x/cover1.png`
    ) : (
      <div tw="flex flex-col relative fixed left-0 top-0 w-full h-full">
        <img
          src={`${appURL()}/lum0x/cover2.png`}
          alt=""
          tw="absolute left-0 top-0 w-full h-full"
        />
        <div tw="flex text-white">
          <div tw="flex flex-col p-30 mt-20">
            {state.sortedChannels
              ?.slice(0, 3)
              .map(([channelId, reactionData]: any, i: number) => (
                <div key={channelId} tw="flex flex-col ">
                  <h2 tw="flex">
                    Rank.{i + 1} {channelId}
                  </h2>
                  <div tw="flex">
                    {Object.keys(reactionData)
                      .filter((type) => type !== "total")
                      .map((reactionType) => (
                        <span key={reactionType} tw="mr-4">
                          {reactionType}: {reactionData[reactionType]}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    ),
    imageOptions: {
      dynamic: true,
      aspectRatio: "1:1",
    },
    textInput: "Input target FID",
    buttons: [
      <Button
        action="post"
        target={{ pathname: "/", query: { targetFid: message?.inputText } }}
      >
        Find
      </Button>,
    ],
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
