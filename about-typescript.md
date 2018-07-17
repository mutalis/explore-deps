# About TypeScript

Objective: go from "Why would I TypeScript" to understanding how TypeScript operates on the server, in Node.

Out of scope: 
-   front end development. I know it's important and useful, but it is not my thing.
-   http servers. This is a strength of Node, but it's covered on the web. See express [link].

Audience: backend developers in other languages, especially Java. JavaScript developers will know a lot of this stuff already, although not all of it. I assume little familiarity with JavaScript.

Thesis: We program in language systems. TypeScript is a good language built on a very thick language system (JavaScript and Node), so while the basics are easy and fun, there's a lot to know when you get past them.

Structure: four 20-minute sections, followed by Q&A.

I've been writing TypeScript seriously for less than a year, and my background is not JavaScript, so there's a lot I don't know. That's OK, because the best person to learn from is the person a few notches ahead of you, not leagues ahead. It helps to remember what it was like, being confused by all this. Every day refreshes my memory.

## Section 1: TypeScript, the language

in which I hope to convince you that this language has some cool features, and you might want to use it.

Cover:
-   all js is ts
-   tsc outputs js, even when it fails
-   union types
-   type guards
-   type parameters and defaults
-   interfaces
-   classes and the tricky bit about private fields
-   vscode: type hints, useful error messages
-   function types and that stupid thing where you have to supply a name
-   default parameters that use prior parameters
-   parameter objects, Partial, spread
-   destructuring

## Section 2: The runtime. Node and the many dialects of JavaScript

-   ... but what kind of JS does it output?
-   callbacks, promises, async/await
-   Node and V8. thread locals?

## Section 3: The packaging. NPM and the mythical modules of JavaScript

-   JS didn't always have a module system. Some dialects now do.
-   imports in TypeScript
-   declaring dependencies. 3 types
-   what npm does and how to decipher what it does
-   output: outDir or outFile (amd or system module output only)
-   npm .bin

## Section 4: Leveraging TypeScript to find bugs

-   stricter compiler options
-   testing
   -   ts-node/register
-   tslint
### Compiler options
-   "lib" brings in type definitions
-   skipLibChecks lets you not worry about perfect compatibility with every freaking library everywhere


useful:
-   https://blog.angular-university.io/typescript-2-type-system-how-do-type-definitions-work-in-npm-when-to-use-types-and-why-what-are-compiler-opt-in-types/