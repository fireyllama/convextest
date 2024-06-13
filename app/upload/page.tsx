"use client";

import { Code } from "@/components/typography/code";
import { Link } from "@/components/typography/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { api } from "@/convex/_generated/api";
import {
  useMutationWithAuth,
  useQueryWithAuth,
  useSessionId,
  useSignOut,
  useSignUpSignIn,
} from "@convex-dev/convex-lucia-auth/react";
import { useMutation } from "convex/react";
import { add } from "date-fns";

export default function Home() {

  return (
    <main className="container max-w-2xl flex flex-col gap-8">
      <h1 className="text-4xl font-extrabold my-8 text-center">
        apelpasd
      </h1>
      {<AuthForm />}
    </main>
  );
}


function AuthForm() {
  const { viewer, numbers } =
    useQueryWithAuth(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const addNumber = useMutation(api.myFunctions.addNumber);
  const sendURL = useMutation(api.myFunctions.sendURL);
  const sendArticle = useMutation(api.myFunctions.sendArticle);

  return (
    <>
      <p>
        <Button
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add num (in backend)
        </Button>
      </p>
      <p>
        nums:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : numbers ? numbers.join(", ") : "..."}
      </p>
      <form onSubmit={(event) => {event.preventDefault();}}>
        <label htmlFor="url">Video TItle</label>
        <Input type="text" name="title" id="videoTitle" className="mb-4" />
        <label htmlFor="url">URL</label>
        <Input type="text" name="url" id="videoUrl" className="mb-4" />
        <Button 
        onClick={() => {
          const videoTitleElement = document.getElementById('videoTitle') as HTMLInputElement;
          const videoUrlElement = document.getElementById('videoUrl') as HTMLInputElement;
          if (videoTitleElement !== null && videoUrlElement !== null) {
            void sendURL({ title: videoUrlElement.value, url: videoTitleElement.value });
          }
          videoTitleElement.value = '';
          videoUrlElement.value = '';
        }}
        type="submit">Send URL</Button>
      </form>
      

      <form onSubmit={(event) => {event.preventDefault();}}>
        <label htmlFor="url">Article Title</label>
        <Input type="text" name="url" id="articleTitle" className="mb-4" />
        <label htmlFor="url">Article Content</label>
        <Textarea className="w-full" id="articleContent"/>
        <Button 
        onClick={() => {
          const articleTitle = document.getElementById('articleTitle') as HTMLInputElement;
          const articleContent = document.getElementById('articleContent') as HTMLTextAreaElement;

          if (articleTitle !== null && articleContent)
            void sendArticle({ title: articleTitle.value, content: articleContent.value});  
          articleTitle.value = '';
          articleContent.value = '';
        }}
        
        type="submit">Send article</Button>
      </form>

    </>
  );
}
