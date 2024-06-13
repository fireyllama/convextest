"use client";

import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardTitle, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import { useEffect } from "react";

import { api } from "@/convex/_generated/api";
import {
  useMutationWithAuth,
  useQueryWithAuth,
  useSessionId,
  useSignOut,
  useSignUpSignIn,
} from "@convex-dev/convex-lucia-auth/react";
import { useMutation } from "convex/react";
import React, { CSSProperties, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from "react-beautiful-dnd";

import { add, set } from "date-fns";
import { query } from "@/convex/_generated/server";
import { TableDefinition } from "convex/server";
import { Item } from "@radix-ui/react-accordion";
import { modifyBucket } from "@/convex/myFunctions";


interface Item {
  id: string;
  title: string;
  content: string;
  type: string;
  articleContent?: string;
}

const getItems = (count: number, offset = 0): Item[] =>
  Array.from({ length: count }, (_, k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    title: `Title ${k + offset}`,
    content: `Description ${k + offset}`,
    type: `Type ${k + offset}`
  }));

const convertToItemsArray = (itemsData: any[]): Item[] => {
  const items: Item[] = itemsData.map((item, index) => ({
    id: `item-${index + 1}-${new Date().getTime()}`, // Example ID generation
    title: item.title,
    content: item.content, 
    type: item.type
  }));
  return items;
};

const reorder = (list: Item[], startIndex: number, endIndex: number): Item[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (
  source: Item[],
  destination: Item[],
  droppableSource: { index: number, droppableId: string },
  droppableDestination: { index: number, droppableId: string }
): Record<string, Item[]> => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: Record<string, Item[]> = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties | undefined): React.CSSProperties => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "black",
  ...draggableStyle,
  ...(draggableStyle && draggableStyle) // Ensure draggableStyle is not undefined
});

const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
  background: isDraggingOver ? "grey" : "black",
  padding: grid,
  minWidth: 250,
  maxWidth: 250,
  marginRight: grid,
});

export default function Home() {
  const sessionId = useSessionId();

  return (
    <main className="container w-full flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        mr c my goat
      </h1>
      {sessionId ? <SignedIn /> : <AuthForm />}
    </main>
  );
}

function SignedIn() {
  const { viewer, numbers } =
    useQueryWithAuth(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  // const headers = useQueryWithAuth(api.myFunctions.getBucketNames, {})?.buckets ?? [];
  // const bucket = useQueryWithAuth(api.myFunctions.getBucket, {name: "N/A"})?.bucket ?? [];
  const {viewer2, buckets} = useQueryWithAuth(api.myFunctions.getBuckets, {}) ?? {};

  const [state, setState] = useState<Item[][]>([]);
  const [columnTitles, setColumnTitles] = useState<string[]>(['Column 1']); // Initialize with one column title
  
  const [columnAuthors, setColumnAuthors] = useState<string[]>(['Author 1']); // Initialize with one column author

  const { urls } = useQueryWithAuth(api.myFunctions.listUrls, {}) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);
  const sendURL = useMutation(api.myFunctions.sendURL);
  const sendArticle = useMutation(api.myFunctions.sendArticle);
  const modifyBucket = useMutation(api.myFunctions.modifyBucket);
  const createBucket = useMutation(api.myFunctions.createBucket);
  const deleteBucket = useMutation(api.myFunctions.deleteBucket);

  useEffect(() => {
    if (buckets) {
      setColumnTitles(buckets.map(bucket => bucket.name));
      setColumnAuthors(buckets.map(bucket => bucket.author));
      setState(buckets.map(bucket => convertToItemsArray(bucket.items)));
      // buckets.forEach(bucket => { //cloud overrides current bucket state 
      //   const items = convertToItemsArray(bucket.items);
      //   setState([...state, items]);
      //   console.log("hello")
      //   console.log(items)
      // });
      
      
    }
  }, [buckets]);

  if (!buckets) {
    return <p>Loading...</p>;
  }

  console.log(buckets);

  

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      setState(newState.filter(group => group.length));
    }
  }

  function handleAddColumn() {
    setState([...state, []]);
    setColumnTitles([...columnTitles, `Column ${columnTitles.length + 1}`]);
    setColumnAuthors([...columnAuthors, `Author ${columnAuthors.length + 1}`]);
  }

  function handleAddItem() {
    setState([...state, getItems(1)]);
  }

  function handleColumnTitleChange(index: number, title: string) {
    const newTitles = [...columnTitles];
    newTitles[index] = title;
    setColumnTitles(newTitles);
  }

  function handleColumnAuthorChange(index: number, author: string) {
    const newAuthors = [...columnAuthors];
    newAuthors[index] = author;
    setColumnAuthors(newAuthors);
  }

  function handleSave() {

    const data = state.map((column, index) => ({
      title: columnTitles[index],
      author: columnAuthors[index],
      items: column
    }));
    console.log(data);
    let finalIndex = 0
    data.forEach((column, index) => {
      console.log(column, index);
      if (buckets) {
        const modifiedItems = column.items.map(item => {
          const { id, ...rest } = item;
          return rest;
        });
        if (index < buckets.length) {
          void modifyBucket({id: buckets[index]._id, name: column.title, author: column.author, items: modifiedItems});
        } else {
          void createBucket({name: column.title, author: column.author, items: modifiedItems});
        }
      }  
      finalIndex = index;
    });
    if (buckets && finalIndex < buckets.length) {
      for (let i = finalIndex + 1; i < buckets.length; i++) {
        void deleteBucket({id: buckets[i]._id});
      }
    }
  }

  return (
    <>
      <p className="flex gap-4 items-center">
        welcome {viewer}
        <SignOutButton />
      </p>

      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers ? numbers.join(", ") : "..."}
      </p>
      <p>
        URLs:{" "}
        {urls?.length === 0
          ? "Click the button!"
          : urls ? urls.join(", ") : "..."}
      </p>

      <div>
        <Button type="button" onClick={handleAddColumn}>
          Add new group
        </Button>
        {/* <Button type="button" onClick={handleAddItem}>
          Add new item
        </Button> */}
        <Button type="button" onClick={handleSave} className="ml-4">
          Save
        </Button>
        <div style={{ display: "flex", flex: "1 0 auto", overflowX: "auto", width: "100%" }}>
          <DragDropContext onDragEnd={onDragEnd}>
            {state.map((el, ind) => (
              <Droppable key={ind} droppableId={`${ind}`}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    <Input
                      type="text"
                      value={columnTitles[ind]}
                      onChange={(e) => handleColumnTitleChange(ind, e.target.value)}
                      placeholder={`Column ${ind + 1}`}
                      className="mb-2"
                    />
                    <Input
                      type="text"
                      value={columnAuthors[ind]}
                      onChange={(e) => handleColumnAuthorChange(ind, e.target.value)}
                      placeholder={`Author ${ind + 1}`}
                      className="mb-4"
                    />
                    {el.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                            className="mb-2 p-4 border rounded-lg shadow-sm"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-bold">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.content}</p>
                                <p className="text-xs text-gray-400">{item.type}</p>
                              </div>
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  const newState = [...state];
                                  newState[ind].splice(index, 1);
                                  setState(
                                    newState.filter(group => group.length)
                                  );
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </div>
    </>
  );
}


function SignOutButton() {
  const signOut = useSignOut();
  return <Button onClick={signOut}>Sign out</Button>;
}

function AuthForm() {
  const { flow, toggleFlow, error, onSubmit } = useSignUpSignIn({
    signIn: useMutationWithAuth(api.auth.signIn),
    signUp: useMutationWithAuth(api.auth.signUp),
  });
  console.log(error);

  return (
    <div className="flex flex-colitems-center px-20 gap-4">
      <form
        className="flex flex-col h-[18rem]"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <label htmlFor="username">Email</label>
        <Input name="email" id="email" className="mb-4" />
        <label htmlFor="password">Password</label>
        <Input
          type="password"
          name="password"
          id="password"
          className="mb-4 "
        />
        <Button type="submit">
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </Button>
      </form>
      {/* <Button variant="link" onClick={toggleFlow}>
        {flow === "signIn"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </Button> */}
      <div className="font-medium text-sm text-red-500">
        {error !== undefined
          ? flow === "signIn"
            ? "Could not sign in"
            : "Could not sign up, did you mean to sign in?"
          : null}
      </div>
    </div>
  );
}