import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { queryWithAuth } from "@convex-dev/convex-lucia-auth";
import { title } from "process";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

const queueBucketId = 'k57dj45yq0edsjf767z1k333as6tyxwc'


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
      numbers: numbers.reverse().map((number) => number.value),
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
      urls: urls.reverse().map((url) => url.value),
    };
  },
});


export const getBuckets = queryWithAuth({
  args: {
  },
  handler: async (ctx, args) => {
    const buckets2 = await ctx.db.query("buckets").order("desc").collect();
    return {
      viewer2: ctx.session?.user.email,
      buckets: buckets2.reverse().map((bucket) => bucket),
    };
  },
});



// export const getDocuments = defineFunction(async ({ db }: { db: TableDefinition<Document> }) => {
//   // Fetch documents from the database
//   const documents = await db.find({});

//   return documents;
// });

// // export const getItems = queryWithAuth({
// //   args: {
// //     type: v.string(),
// //     id: v.string(),
// //   },
// //   handler: async (ctx, args) => {
// //     const idNormal = ctx.db.normalizeId(args.type, args.id)

// //     const items = await ctx.db
// //       .query(args.type)
// //       .filter((q) => q.eq(q.id(), args.id))
// //       .collect();
// //     return {
// //       viewer: ctx.session?.user.email,
// //       items: items.reverse().map((item) => item),
// //     };
// //   },
// // });

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
    
    console.log("Added new number with id:", id);
  },
});


export const modifyBucket = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    author: v.string(),
    items: v.array(v.object({
      title: v.string(),
      content: v.string(),
      type: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const idNormal = ctx.db.normalizeId("buckets", args.id)

    if (idNormal !== null) {
      const retrieved = await ctx.db.get(idNormal);
      console.log("Retrieved number with id:", idNormal, retrieved);
      if(retrieved !== null) {
        const itemInBucketId = await ctx.db.patch(idNormal, {name: args.name, author: args.author, items: args.items})
        console.log("Added number to bucket with id:", idNormal, itemInBucketId);
      }
    }
  },
});

export const createBucket = mutation({
  args: {
    name: v.string(),
    author: v.string(),
    items: v.array(v.object({
      title: v.string(),
      content: v.string(),
      type: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("buckets", { name: args.name, author: args.author, items: args.items });
    console.log("Added new bucket with id:", id);
  },
});

export const deleteBucket = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const idNormal = ctx.db.normalizeId("buckets", args.id)

    if (idNormal !== null) {
      const retrieved = await ctx.db.get(idNormal);
      console.log("Retrieved number with id:", idNormal, retrieved);
      if(retrieved !== null) {
        const itemInBucketId = await ctx.db.delete(idNormal)
        console.log("Added number to bucket with id:", idNormal, itemInBucketId);
      }
    }
  },
});

export const sendURL = mutation({
  args: {
    title: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("urls", { value: args.url });
    console.log("Added new URL with id:", id);

    const queueBucketIdNormal = ctx.db.normalizeId("buckets", queueBucketId)

    if (queueBucketIdNormal !== null) {
      const retrieved = await ctx.db.get(queueBucketIdNormal);
      console.log("Retrieved number with id:", queueBucketIdNormal, retrieved);
      if(retrieved !== null) {
        const itemInBucketId = await ctx.db.patch(queueBucketIdNormal, {items: [...retrieved.items, { title: args.title, content: args.url, type: "video" }]})
        console.log("Added number to bucket with id:", queueBucketIdNormal, itemInBucketId);
      }
    }

    
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

    const queueBucketIdNormal = ctx.db.normalizeId("buckets", queueBucketId)

    if (queueBucketIdNormal !== null) {
      const retrieved = await ctx.db.get(queueBucketIdNormal);
      console.log("Retrieved number with id:", queueBucketIdNormal, retrieved);
      if(retrieved !== null) {
        const itemInBucketId = await ctx.db.patch(queueBucketIdNormal, {items: [...retrieved.items, { title: args.title, content: args.content, type: "article" }]})
        console.log("Added number to bucket with id:", queueBucketIdNormal, itemInBucketId);
      }
    }
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
