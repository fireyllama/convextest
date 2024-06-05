import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { queryWithAuth } from "@convex-dev/convex-lucia-auth";
import { title } from "process";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = queryWithAuth({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    

    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: ctx.session?.user.email,
      numbers: numbers.toReversed().map((number) => number.value),
    };
  },
});

export const listUrls = queryWithAuth({
  args: {
  },
  handler: async (ctx, args) => {
    const urls = await ctx.db
      .query("urls")
      .order("desc")
      .collect();
    return {
      viewer: ctx.session?.user.email,
      urls: urls.toReversed().map((url) => url.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });
    const id2 = 'k5700vq0frbmj04vrvayz147wn6tc6ze'
    const id3 = ctx.db.normalizeId("buckets", id2)

    if (id3 !== null) {
      const retrieved = await ctx.db.get(id3);
      console.log("Retrieved number with id:", id3, retrieved);
      if(retrieved !== null) {
        const id4 = await ctx.db.patch(id3, {items: [...retrieved.items, { id: id, type: "apples" }]})
      }
      // const id4 = await ctx.db.insert("buckets", {name: "Bucket 1", items: [{ id: id3, type: "numbers" }]})
      
      
    }

    



    console.log("Added new number with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

export const sendURL = mutation({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("urls", { value: args.url });
    console.log("Added new URL with id:", id);

    const id2 = 'k5700vq0frbmj04vrvayz147wn6tc6ze'
    const id3 = ctx.db.normalizeId("buckets", id2)
    // if (id3 !== null) {
    //   const id2 = await ctx.db.patch(id3, {items: {name: "Bucket 1", items: [{ id: id, type: "urls" }]}})
    // }
  },
});

export const sendArticle = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("articles", { title: args.title, content: args.content });
    console.log("Added new article with id:", id);
  },
});



// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
      sessionId: null,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
