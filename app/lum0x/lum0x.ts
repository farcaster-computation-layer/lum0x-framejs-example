import { farcasterHubContext } from "frames.js/middleware";
import { createFrames } from "frames.js/next";
import { Lum0x } from "lum0x-sdk";
import { DEFAULT_DEBUGGER_HUB_URL } from "../debug";

type State = {
  targetFid: string;
  data: any;
  sortedChannels: any;
  executedFid: string;
};

Lum0x.init("TEST_KEY");
const seenReactions = new Set();
let data: any;
let cursor: string | undefined;

// Functions to get reaction data for a specific user
const getReactionByUser = async (fid: string, cursor?: string) => {
  try {
    let res = await Lum0x.farcasterReaction.getReactionByUser({
      fid: Number(fid),
      type: "all",
      limit: 100,
      cursor: cursor,
    });
    return res;
  } catch (e) {
    console.error(e);
  }
};

// Functions to get data from multiple pages
export const getBulkReactionByUser = async (fid: string, limit: number) => {
  let allData: any[] = [];
  let count = Math.ceil(limit / 100);

  for (let i = 0; i < count; i++) {
    const result = await getReactionByUser(fid, cursor);
    if (result?.reactions) {
      const filteredReactions = result.reactions.filter((reaction: any) => {
        const uniqueKey = reaction?.cast.hash + reaction?.reaction_timestamp;
        if (uniqueKey && !seenReactions.has(uniqueKey)) {
          seenReactions.add(uniqueKey);
          return true;
        }
        return false;
      });

      allData = [...allData, ...filteredReactions];
      cursor = result.cursor;
    }
    if (!result?.cursor) break;
  }

  data = allData;
};

// Function to count reaction_type counts per channel
const getChannelReactionCounts = () => {
  const channelCounts: any = {};

  data?.forEach((reaction: any) => {
    const channelId = reaction.cast.channel?.id;
    const reactionType = reaction.reaction_type;

    if (!channelCounts[channelId]) {
      channelCounts[channelId] = {};
      channelCounts[channelId]["total"] = 0;
    }

    if (!channelCounts[channelId][reactionType]) {
      channelCounts[channelId][reactionType] = 0;
    }
    channelCounts[channelId][reactionType] += 1;
    channelCounts[channelId]["total"] += 1;
  });

  return channelCounts;
};

// Functions to sort reactions by channel into a large number of orders
export const getSortedChannelsByReactions = () => {
  const channelReactionCounts = getChannelReactionCounts();

  return Object.entries(channelReactionCounts).sort(
    ([, a]: any, [, b]: any) => b.total - a.total
  );
};

// Frame handler
export const lum0x = createFrames<State>({
  basePath: "/lum0x",
  middleware: [
    farcasterHubContext({
      hubHttpUrl: DEFAULT_DEBUGGER_HUB_URL,
    }),
  ],
  initialState: {
    targetFid: "",
    data: null,
    sortedChannels: null,
    executedFid: "",
  },
  debug: process.env.NODE_ENV === "development",
});
