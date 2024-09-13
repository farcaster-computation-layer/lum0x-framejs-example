/* eslint-disable react/jsx-key */
import { Button } from "frames.js/next";
import {
  getBulkReactionByUser,
  getSortedChannelsByReactions,
  lum0x,
} from "./lum0x";

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
      const data = await getBulkReactionByUser(targetFid, 1000);
      state.data = data;

      const sortedChannels = getSortedChannelsByReactions();
      state.sortedChannels = sortedChannels;
    }
  };

  if (message?.inputText) {
    await excute(fid);
  }

  return {
    image: (
      <div tw="flex flex-col">
        <div tw="flex">
          Find the channels where a specific FID is most active
        </div>
        {message?.inputText && <div tw="flex">{`targetFid: ${fid}`}</div>}
        {message && <div tw="flex">{`requesterFid: ${executedFid}`}</div>}
        <div tw="flex">
          <div tw="flex flex-col">
            {state.sortedChannels
              ?.slice(0, 3)
              .map(([channelId, reactionData]: any) => (
                <div key={channelId} tw="flex flex-col">
                  <div tw="flex"> {channelId}</div>
                  <div tw="flex"> Total Reactions: {reactionData.total}</div>
                  <div tw="flex">
                    {Object.keys(reactionData)
                      .filter((type) => type !== "total")
                      .map((reactionType) => (
                        <span key={reactionType}>
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
