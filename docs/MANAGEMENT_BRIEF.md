# L&D initiative: Astro + Payload with Claude Code

**Owner:** Dale, Technical Architect · **Date:** 25 September 2026 · **Format:** 1.5-hour internal workshop · **Audience:** junior developers, with a focus on the WordPress team

## What it is

A hands-on training session that moves our junior developers from WordPress onto the stack we are standardising on for new web projects: **Payload CMS** for content management and **Astro** for the website frontend, built with **Claude Code**, the AI coding assistant every developer already has through our Teams subscription.

The session is 30 minutes of explanation and 60 minutes of doing. Working individually on their own laptops, developers take a real WordPress feature, a "Case Studies" content type with its custom fields and page templates, and rebuild it on the new stack, using Claude Code the way our standards say it should be used.

## Why we are doing it

- **The new stack is where our projects are going.** Astro and Payload give clients faster sites and give us a content model that lives in version control, so it can be reviewed, tested and rolled back like any other code. WordPress cannot offer that.
- **Our WordPress developers have the steepest learning curve** and the most to gain. The session is built around their existing knowledge: every new concept is taught next to the WordPress concept it replaces.
- **Claude Code changes the economics of upskilling.** Developers can be productive on an unfamiliar stack far sooner if they are taught to use the assistant well. Teaching both at once, on a real task, is faster than teaching either in isolation.
- **It reinforces the Claude Code standards** already presented to the team. The workshop uses our internal claude-kit tooling and the same working habits, so the standard becomes practice rather than a slide.

## What has been prepared

Everything is built and tested. Attendees will not lose time to setup on the day.

- A ready-to-run starter project with a worked example, a seeded database, and one-command setup and environment checks.
- The WordPress feature to port, frozen as reference code so the task is concrete.
- A task brief with acceptance criteria for each step, seven optional stretch exercises for faster attendees, and a facilitator guide with a timing plan and known failure modes.
- A completed reference solution, committed step by step, for the debrief.
- A 25-slide presentation with speaker notes ([view it here](https://claude.ai/code/artifact/6c2b3bc7-b63a-4a8b-9932-95f0e5ac9d9b)), including a jargon section that names every Astro and Payload term attendees will meet, each beside its WordPress equivalent.
- A written glossary of the same terms for use during the hands-on and afterwards.
- A pre-session checklist so every laptop is verified before the day.

## Cost

| Item | Time |
| --- | --- |
| Preparation (complete) | Done, one architect |
| Attendee preparation | About 10 minutes each, before the day |
| The session | 1.5 hours per attendee, plus 1 facilitator |
| Follow-up session, two weeks later | 30 minutes per attendee |

No new tooling or licences are required. Claude Code seats are already in place.

## What we expect to get

- Every attendee leaves having built a working Payload collection and Astro pages from a WordPress specification, with Claude Code, in under an hour.
- WordPress developers can contribute to Astro + Payload projects with support, rather than being blocked from them.
- A shared vocabulary between the WordPress and JavaScript developers, which reduces handover friction on mixed projects.
- Concrete feedback on our Claude Code standards, folded back into claude-kit so every future project starts better configured.

## How we will know it worked

- On the day: completion of the core task by every attendee, and a short exit survey on what mapped cleanly from WordPress and what did not.
- Two weeks later: a 30-minute follow-up where the same people port a small feature from a live Webee WordPress site.
- Within the quarter: at least one client project on Astro + Payload with a former WordPress developer contributing.

## Risks and how they are handled

- **Setup time eating the session.** Mitigated by pre-verified laptops, a one-command setup, an automated environment check, and an offline copy of dependencies on the day.
- **Learning a stack and a tool at once.** Mitigated by the WordPress-first framing, and by a jargon section in the presentation plus a written glossary, so no term is met for the first time mid-task. JavaScript developers are seated within reach of WordPress developers to help on request.
- **Over-reliance on the assistant.** Mitigated by the working habits enforced during the session: plan mode before any change, reading every diff before accepting it, and the facilitator asking individuals at random to explain a change they accepted. A change its author cannot explain is reverted and redone.

## Ask

No decision is required. This brief is for visibility. If management would like to observe the session or the follow-up, both are open.
