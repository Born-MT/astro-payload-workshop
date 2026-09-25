# Presenter script, slide by slide

Facilitator branch only. Paste each block into the presenter notes of the matching slide. Lines in `[square brackets]` are cues for you, not words to say. Timings match the `data-time` on each slide: 30 minutes total, of which about seven are the two live demos on slides 8 and 25. If you are behind at slide 13, drop the explain-back on slide 13 and read only one row on each jargon slide.

Speaking pace assumed: about 130 words a minute. Spoken words total about 3,300, which is 25 minutes, plus about 7 minutes for the two demos. To land on 30, skip the explain-back on slide 13 and the optional failure demo on slide 26.

---

## 1 · From WordPress to Astro + Payload · 0:00

[Before the slides. Look at the room.]

Quick show of hands. Who has built an ACF field group in the last month?

Keep your hand up if you have ever renamed a field in that group and then had to grep the theme for the old key.

Right. By the end of this hour you will have built that same field group as one TypeScript file. That file will give you an admin panel, a JSON API and a typed frontend without you writing any of those three. And it will be the first slice of a portfolio site that is yours, not a client's.

Three parts for the next thirty minutes. One: what is the same and what is different between WordPress and this stack. Two: what has to be true on your laptop before you start. Three: what you are building and how the ladder works.

Then sixty minutes of doing, each of you on your own laptop, with a gate after every step.

Nobody needs to understand everything on these slides. They exist so the doing makes sense.

---

## 2 · WordPress vs Astro + Payload: what changes · 0–4 min

WordPress made a trade in 2010 that was correct in 2010. The content model lives in the database so a non-developer can build it in wp-admin. The cost is that the model has no diff, no review and no rollback. Renaming an ACF field means editing it in wp-admin on every environment, then grepping the templates for the old key.

We are a development shop. For us that trade now costs more than it gives.

On the right, the same job on the new stack. The content model is a TypeScript file in git. It goes through a pull request like any other code. Payload generates types from it, Astro imports those types, and when you rename a field the build lists the templates that broke.

Astro renders HTML on the server from Payload's REST API. No database on the frontend. Claude Code writes the boilerplate from the collections, the types and CLAUDE.md. You review it.

[If you have a real Webee client where page load or plugin maintenance cost real hours, say it here in one sentence.]

For the next nineteen minutes: everything you know has a name on this stack. Payload first, then Astro, then one slide that sorts the names into same, different and new.

---

## 3 · Why teams move to Astro + Payload · 0–4 min

[Ninety seconds. Do not read the six boxes.]

The honest version first. WordPress is still the right answer for a site a non-developer has to build and run alone, and for a client who wants a theme marketplace. Our clients pay for performance, security and change requests. For that work, these six reasons are why the stack changed.

Three is the one that connects to everything after this slide. The content model is code. The rest of the talk is what that looks like in practice.

One and two are the ones clients feel: static HTML by default, no third-party PHP per request. Five is the one management asked about: MIT licensed, self-hosted, no per-seat fees.

[If someone says WordPress can be headless too:] It can, and that is the half-step many teams took first. The model still lives in a database and the frontend still reads untyped JSON. Payload closes that gap.

---

## 4 · Three ideas the rest of the talk builds on · 0–4 min

This is the spine of the talk. Three ideas.

One. The content model lives in code. A collection file is the CPT registration and the ACF group in one object. Payload generates the admin and the API from it.

Two. The frontend only consumes the REST API. Astro has no database connection. It fetches JSON in the frontmatter and renders HTML on the server.

Three. Claude Code writes, you review. It generates the code. You read the diff and decide. If you cannot explain a diff, you do not accept it.

Every slide from here has a coloured dot in the top left. Yellow is idea one, green is idea two, blue is idea three. That tells you which idea the slide serves.

If you leave with only these three sentences, this session worked. I will come back to this slide in the debrief and ask you to say them without looking.

---

## 5 · Two apps, one REST API between them · 4–7 min

Here is the picture.

Left: Payload. It is the folder apps/cms, it runs on port 3300. Collections are TypeScript. The admin panel at /admin is generated. The REST API at /api is generated. Today the database is a single SQLite file.

Right: Astro. The folder apps/web, port 4321. Pages are files. Each page fetches in its frontmatter and renders HTML. It imports the types the CMS generated. It ships zero JavaScript unless you ask for some.

The only thing that crosses between them is JSON over HTTP. That arrow in the middle is the entire contract.

Quick check. Where does the database password live?

[Wait. Expected: only in apps/cms. If anyone says both, repeat: Astro never touches the database. It only reads JSON.]

That is why Astro never needs credentials, and why either side can be swapped later.

---

## 6 · Toolchain terms you will see in the logs · 4–7 min

[Thirty seconds. Do not read it.]

This is the first of seven vocabulary slides. Every word on them is in docs/GLOSSARY.md with its WordPress equivalent. Keep that file open this afternoon.

The point of this slide is only this: when pnpm, Turbopack or Vite shows up in your terminal, nothing is broken. Those are the package manager and the two bundlers. You never write them.

Two rows to notice. Typecheck: pnpm typecheck finds every place a type does not fit before anything runs. It is the fastest test you will ever have. And .env: secrets read at boot, never committed. It is the one file Claude is not allowed to touch.

---

## 7 · This file is the CPT and the ACF group · 7–13 min

Left is what you know. register_post_type, and then a field group you click together in wp-admin.

Right is Services.ts from the repo. Let me read it line by line with the WordPress word for each.

slug: 'services'. That is the post type name.

useAsTitle: 'title'. That is what shows in the list table.

access: read returns true. That is the capability check. Public read, and everything else needs a logged-in user.

fields. That is the ACF group.

Look at summary. required: true, maxLength: 240. In ACF those are two checkboxes on a settings screen. Here they are two words that a reviewer can see in a diff.

There is no separate ACF export. This file is the export.

[Pause.]

Services is the worked example in the repo. Step one this afternoon is the same file, for Projects.

---

## 8 · One collection file generates three things · 7–13 min

[Live demo, about five minutes, by hand, no Claude. Slowly.]

One file gives you three things. An admin form. A REST endpoint. A TypeScript type. And it gives you nothing at all until the collection is in the array in payload.config.ts. That is the most common step-one failure, so remember it.

Let me prove the three things.

[Open Services.ts. Add `{ name: 'tagline', type: 'text' }` to the fields. Save. Restart the CMS.]

Before I refresh the admin: what will be different?

[Wait for "a new text box". Refresh /admin, open a service. Point at tagline.]

Now the API. Before I refresh it: will tagline be in the JSON already, or only after I fill it in?

[Wait. Refresh GET /api/services. Point at "tagline": null.]

It is there already, as null, on every existing document. The shape of the data comes from the file, not from what is in the database. That is idea one.

[Add one line in ServiceCard.astro to render service.tagline. Refresh the site.]

And that is the whole architecture, end to end. A field in a file, a form, a JSON key, a typed prop in a template.

[Either remove the tagline field now, or leave it and say you did. Do not leave a broken state. Step 0's gate counts four cards, so an extra field does not affect it.]

---

## 9 · The vocabulary map · 7–13 min

[Do not read the table. Three rows.]

This is the full map. It lives in wordpress-reference/README.md, and every other word is in the glossary. The next three slides are the short version. Three rows now.

Options page. New this time. The profile page of the portfolio you are porting is an ACF options page. In Payload that is a Global: one document, no list. Step five is that port.

WP_Query. The where syntax looks odd inside a URL, but it is meta_query with the nesting written out. Same idea.

Depth. This is the one concept with no WordPress name. In WordPress a relationship field gives you an ID and you call get_post yourself. In Payload, depth equals one says: populate one level of related documents in the same response. It will bite you in stretch card A, so I am naming it now and I will come back to it.

---

## 10 · Payload terms: collections and config · 7–13 min

[Point, do not read.]

Three rows.

Slug has two meanings, and Claude will use both in one sentence. The collection's id, slug: 'projects'. And a field you define for URLs. Same word, two things.

Registering. A collection that is not in the collections array in payload.config.ts does not exist. First failure everyone hits.

Global. Step five uses one, and its API path is different: /api/globals/profile, not /api/profile.

And hooks. Same word as WordPress, same idea, beforeChange is save_post. Not the same thing as Claude Code hooks, which come in part two. Two different hooks today. I will say which one I mean.

---

## 11 · Payload terms: field types · 7–13 min

This is the ACF field type dropdown, renamed. Most of you can relax here.

Two rows.

Array is Repeater. The sub-fields are a nested fields array inside the array field. That nesting trips people in step one, because stack and highlights are both arrays.

richText is WYSIWYG, but the output is JSON, not HTML. That is why stretch card C needs convertLexicalToHTML to render it.

---

## 12 · Payload terms: REST API and data · 7–13 min

Four rows here have no WordPress word, and they are the four that will cost you time this afternoon. Depth you have seen. The other three, once each.

The union type. A relationship comes back typed as number or Service. At depth zero it is an id, at depth one it is the document. Guard with typeof.

generate:types. Run it after every field change. It writes payload-types.ts, and Astro imports from there. Forget it and Astro does not know your new field.

push: true. The SQLite schema syncs on boot in dev. Real projects use migrations. Not today.

One more. The list response is paginated. Your data is in docs, not at the top level. Globals are not paginated: the response is the document itself. Step five meets that difference.

---

## 13 · The PHP at the top of the template is now the frontmatter · 13–19 min

This is the slide WordPress developers relax on. Line by line.

The three dashes fence off the frontmatter. That is the PHP block at the top of your template.

WP_Query becomes getDocs. Same job: fetch a list with a sort.

get_header and get_footer become the Base layout wrapping the page.

get_template_part becomes a component, ServiceCard, with a prop.

The while loop becomes a map.

One difference worth naming. The frontmatter runs on the server at request time and never in the browser. Nothing in it ships to the client.

[Explain-back, ninety seconds. Skip if behind.]

Turn to the person next to you and tell them how a Service gets from the collection file to a card on this page. Ninety seconds.

[Pick two people to say it out loud. You are listening for: file, admin, JSON, fetch, component.]

---

## 14 · File-based routing replaces the template hierarchy · 13–19 min

You carry the template hierarchy diagram in your head. You can delete it.

The URL is the folder path. /services/ is pages/services/index.astro. /services/web-dev/ is pages/services/[slug].astro. The square brackets are the dynamic segment, and Astro.params.slug is its value.

No rewrite rules. No flushing permalinks. No guessing which of six candidate files won.

Look at the 404 line. In WordPress a missing post falls through to the archive or the 404 template and you find out later. Here you decide, in code, in one line: return a Response with status 404. Step four of the ladder has a gate check for exactly that line.

---

## 15 · Querying: where in the query string, depth for relationships · 13–19 min

[Spend a real minute here.]

Depth. The idea most likely to confuse you this afternoon, because it has no WordPress word.

Left: in WordPress a relationship field gives you IDs. You loop and call get_post for each one. One query each.

Right: GET /api/projects?depth=1. The services come back populated, inside the same response. depth=0 would give you the ids only.

The generated type is number or Service. That is the payoff of idea one. The type is honest: at depth zero you get an id, at depth one you get a document, and the compiler makes you handle both. In PHP you would find out in production.

Check. If I set depth=2 on a project, what comes back inside each service?

[Wait. Expected: whatever the service relates to, populated one more level.]

Most of you will meet this in card A. Now you have a name for it.

---

## 16 · Astro terms: the .astro file · 13–19 min

[Fast. Two rows.]

You have just seen the frontmatter slide, so this one is quick.

Slot. Where the children of a layout go. This is the thing Base.astro does that get_header and get_footer cannot: it wraps.

set:html. Render a string as HTML. It is echo without escaping. The only place today where unescaped HTML is correct is rich text from your own CMS. Anywhere else, treat it as a bug.

---

## 17 · Astro terms: routing and rendering · 13–19 min

One row a client will ask you about: SSR versus SSG.

We run SSR today, output: 'server'. Every request renders. Edit content, refresh, see it. Production sites are usually static plus a rebuild hook. That is the cache plugin problem, solved at build time instead of at request time.

The adapter row is what the take-home deployment needs. An SSR site needs an adapter to run somewhere: Node, Vercel, Cloudflare.

And the daemon row. Astro 7, when it detects an AI agent, backgrounds the dev server. Claude Code will hit this in the first ten minutes and it looks like a crash. It is not. astro dev status tells you it is running.

---

## 18 · Astro terms: client-side, and the collections name clash · 13–19 min

Nothing on this slide is used today. It is here because these words are in every Astro tutorial and Claude will mention islands without being asked.

Zero JavaScript by default. An island is one interactive component on a static page. Hydration is loading the JavaScript that makes it interactive.

The row that matters: the name clash. Astro has its own thing called content collections, for local Markdown files. Not Payload's collections. We have none of Astro's today. When a doc or Claude says "collection", ask which one. Payload collections live in apps/cms. Astro content collections would live in apps/web/src/content, and that folder does not exist.

---

## 19 · Same concepts, different architecture, three new terms · 13–19 min

Summary of part one. If anyone asks "so what actually changes", this is the slide.

Left column: everything you have built in WordPress has a place to go. Middle column: five things that feel strange for a week and then feel obvious. Right column: four words with no WordPress equivalent. When someone gets stuck this afternoon, it is usually one of these four.

Check. Which column does slug go in?

[Wait. It is in the first column twice: post_name maps to a field you define, and the post type name maps to the collection slug. If someone says that, part one landed.]

---

## 20 · Prerequisites · 19–24 min

Part two. Five minutes. You have all done this already, it was in the prep checklist.

[Left column fast.] Node 22, pnpm, git, jq, an editor, Claude Code logged in with your Teams seat. PHP and HTML knowledge. TypeScript basics help, not required.

[Right column slowly.] Clone. pnpm install. pnpm setup writes the .env files, wires the git hooks, generates the types and seeds the database. pnpm doctor checks the tools, the .env files, the database, the ports, and that the hooks are wired. pnpm dev starts both servers. And pnpm verify 0 checks that the servers are actually up and the worked example renders.

verify 0 is step zero of the ladder. It is the only step that should already be green when I say go.

Who has verify 0 green right now?

[Anyone without a hand up gets the offline node_modules archive and five minutes while you do the next two slides. Intel mac only; Apple Silicon and Linux need wifi.]

---

## 21 · Working rules, enforced by the gate · 19–24 min

These are the Claude Code standards you have already seen. One thing is new: rule four is now enforced by a script, not by culture.

pnpm verify N runs the acceptance criteria for steps zero to N, in order, against your running servers and your git log, and stops at the first red. A commit tagged (step N) is refused by the commit hooks until step N is green. Removing the tag to get the commit through leaves verify red for that step, and I will see it on the walk-around.

The framing I want you to hold. Claude is faster than you and knows more syntax than you. It is also wrong in ways that look confident. That is exactly what a junior on your team is. You would not merge a junior's PR unread. Same rule here.

And the last one. At some point today Claude will propose editing the hook, or verify.mjs, or .env, as the fix. Calmly and confidently. That fix is wrong. Ask for a different one. Someone in this room will catch it and enjoy catching it.

---

## 22 · What is already in the repo · 19–24 min

Same layers as the standards talk, same colours. Today you only need what is on this slide.

CLAUDE.md is what Claude reads at the start of every session. Read it once.

[Open CLAUDE.md on the projector. Scroll to Conventions.]

This section is why Claude will write your collection the way Services.ts is written. If it does not, the first question is: did it read CLAUDE.md?

Two skills are installed: /payload-new-collection for step one, /payload-new-global for step five. Run them, then read what they made.

The hooks refuse edits to .env, secrets and generated files. A blocked action means the change was wrong, not the hook.

Below the line: copy, do not invent. Services is the worked example. Every step is "like Services, but for Projects". wordpress-reference is the spec. It does not run, you read it.

[Run pnpm verify --status on the projector.]

That is the gate's status. Seven rows, a tick or a cross each. I will be looking at that screen on your laptops all afternoon.

---

## 23 · Target state after 60 minutes · 24–30 min

Part three. Six minutes. This slide answers "why do I care".

You are not porting a client feature. You are porting your portfolio. The three sample projects in the reference are placeholders for three things you have actually built. WordPress sites count.

After sixty minutes: a Projects collection with your projects. A Profile global with your name, headline, bio and links. An archive page, newest first. A detail page with a proper 404. An about page from the global.

The home page stays as the Services worked example today. That is deliberate: the ladder needs a stable example to copy from. The take-home is to replace it and to put the site somewhere with a URL. The follow-up session in two weeks is deployment done properly, and we review the portfolios.

---

## 24 · The ladder: eight steps, each with a gate · 24–30 min

[Ten seconds a step.]

Step zero, done before today. Step one, the Projects collection, ten minutes. Step two, seed three of your projects, six. Step three, the archive page, eight. Step four, the detail page, eight. Step five, Profile global and about page, ten. Step six, two stretch cards, fifteen. Step seven, home page and deploy, take-home.

[Read the callout, slowly, twice.]

pnpm verify N runs steps zero to N in order and stops at the first red. A commit tagged step N is refused until N is green.

That sentence is the whole discipline of the afternoon.

I will call time at the minute marks. Steps one to four are the port. Five and six are where it becomes yours. If you are still on step two at minute twenty-five, you get me at your desk, not a hint from across the room.

Stretch cards are in the brief. WordPress people, A or B is closest to your ACF muscle memory. JavaScript people, E or F. G is a review card with no code.

---

## 25 · Each step is a ticket: paste it as the prompt · 24–30 min

[Live demo, about three minutes. Plan mode on the projector.]

This is the real step one from the brief, as a prompt. Four things it has. Where: the exact file, otherwise Claude picks a path and you review a guess. A pattern to copy: "like Services.ts" carries more than a paragraph. What, precisely: field names and types straight from the ACF export. And acceptance criteria: the gate. Without it there is no definition of done.

Before I run it: which files will this touch?

[Wait. Expected: the new collection file, payload.config.ts, payload-types.ts. If someone says the Astro app, ask why not. Nothing in the prompt asked for it, and a good diff does not include things nobody asked for.]

[Run it in plan mode. Let the plan appear. Read it aloud. Accept. Let the diff scroll and stop once to ask about a line. Run pnpm verify 1 and let it go green. Commit with the tagged message and let them watch the gate run inside the hook.]

Compare with the bad prompt: "add projects". It will produce something. It will not be the port, and verify 1 will tell you so.

---

## 26 · Common failures and their causes · 24–30 min

Five failures you will see today, with the cause and the fix. The full table is in the facilitator guide and I have it on me.

[Optional, if there is time: comment out the registration in payload.config.ts, run pnpm verify 1, show the red line and its hint, fix it, rerun.]

The last row matters most. The gate checks the running server and the rendered page, not your file. A correct file with a stale server is red. Under every red line there is an arrow with a hint. It names the file or the command. Read that line before you put your hand up. Usually it says: restart the CMS, or regenerate the types.

---

## 27 · Start: pnpm dev, pnpm verify 0, plan mode · 30:00

[This slide stays on the wall for the whole hour.]

Go.

pnpm dev. pnpm verify 0. Site on 4321, admin on 3300, login is on the slide. The brief is docs/TASK_BRIEF.md. The words are in docs/GLOSSARY.md. The source you are porting is wordpress-reference.

First prompt, everyone, before anything else: "Explain the layout of this repo and how apps/web gets data from apps/cms, in five bullet points."

[Two people read Claude's answer aloud. Listen for idea two: fetch, JSON, no database.]

Then step one. Plan mode. I will call minute marks. Stuck: read the arrow line, then ask.

[Debrief at minute 57, from the facilitator guide: what mapped cleanly and what did not, which diff did you reject, which gate went red when you thought you were done, and what would you add to CLAUDE.md. Capture the CLAUDE.md answers.]
