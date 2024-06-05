"use client";

import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { api } from "@/convex/_generated/api";
import {
  useMutationWithAuth,
  useQueryWithAuth,
  useSessionId,
  useSignOut,
  useSignUpSignIn,
} from "@convex-dev/convex-lucia-auth/react";
import { useMutation } from "convex/react";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { add } from "date-fns";

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "black",

  // styles we need to apply on draggables
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "grey" : "black",
  padding: grid,
  width: 250
});


export default function Home() {
  const sessionId = useSessionId();

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        apelpasd
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
  const { urls } = useQueryWithAuth(api.myFunctions.listUrls, {}) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);
  const sendURL = useMutation(api.myFunctions.sendURL);
  const sendArticle = useMutation(api.myFunctions.sendArticle);

  const [state, setState] = useState([getItems(10), getItems(5, 10)]);

  function onDragEnd(result) {
    
    const { source, destination } = result;
    console.log(source);
    console.log(destination);

    // dropped outside the list
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
      console.log(newState)
    } else {
      
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];

      setState(newState.filter(group => group.length));
      console.log(newState);

    }
  }
  
  return (
    <>
      <p className="flex gap-4 items-center">
        welcome {viewer}
        <SignOutButton />
      </p>
      
      <p>
        nums:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers ? numbers.join(", ") : "..."}
      </p>
      <p>
        urls:{" "}
        {urls?.length === 0
          ? "Click the button!"
          : urls ? urls.join(", ") : "..."}
      </p>

      <div>
      <Button
        type="button"
        onClick={() => {
          console.log(...state)
          setState([...state, []]);
        }}
      >
        Add new group
      </Button>
      <Button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </Button>
      <div style={{ display: "flex", flex: "10 0 auto"}}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  header maybe
                  {el.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                            }}
                          >
                            
                            {item.content}
                            <Button
                              type="button"
                              onClick={() => {
                                const newState = [...state];
                                newState[ind].splice(index, 1);
                                setState(
                                  newState.filter(group => group.length)
                                );
                              }}
                            >
                              delete
                            </Button>
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
      <Button variant="link" onClick={toggleFlow}>
        {flow === "signIn"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </Button>
      <div className="font-medium text-sm text-red-500">
        {error !== undefined
          ? flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?"
          : null}
      </div>
    </div>
  );
}
