# L&D initiative: Astro + Payload with Claude Code

**Owner:** Dale, Technical Architect · **Date:** 25 September 2026 · **Format:** 1.5-hour internal workshop · **Audience:** junior developers, with a focus on the WordPress team

## What it is

A hands-on training session that moves our junior developers from WordPress onto the stack we are standardising on for new web projects: **Payload CMS** for content management and **Astro** for the website frontend, built with **Claude Code**, the AI coding assistant every developer already has through our Teams subscription.

The session is 30 minutes of explanation and 60 minutes of doing. Working individually on their own laptops, developers port a WordPress portfolio site, a "Project" content type with its custom fields, page templates and a profile settings page, to the new stack. The result is each developer's **own portfolio site**: their projects, their profile, on Astro and Payload. The home page and deployment are the take-home for the follow-up.

The hands-on is a strict ladder. Each step is a ticket with acceptance criteria and a gate: an automated check that runs the criteria against the developer's running site and refuses to let them commit that step until it passes. Steps must be completed in order.

## Why we are doing it

- **The new stack is where our projects are going.** Astro and Payload give clients faster sites and give us a content model that lives in version control, so it can be reviewed, tested and rolled back like any other code. WordPress cannot offer that.
- **Our WordPress developers have the steepest learning curve** and the most to gain. The session is built around their existing knowledge: every new concept is taught next to the WordPress concept it replaces.
- **A portfolio is the one project every developer is motivated to finish.** It is theirs, they will keep working on it after the session, and it is the natural vehicle for the follow-up on deployment.
- **Claude Code changes the economics of upskilling.** Developers can be productive on an unfamiliar stack far sooner if they are taught to use the assistant well. Teaching both at once, on a real task, is faster than teaching either in isolation.
- **It reinforces the Claude Code standards** already presented to the team. The workshop uses our internal claude-kit tooling and the same working habits, and the gate enforces them rather than advising them.

## What has been prepared

Everything is built and tested. Attendees will not lose time to setup on the day.

- A ready-to-run starter project with a worked example, a seeded database, one-command setup and an automated environment check.
- The WordPress portfolio to port, frozen as reference code so every step is concrete.
- A task brief in the form of a seven-step ladder, each step a ticket with acceptance criteria and an exact commit message, plus seven optional stretch cards.
- The gate: a verification script that checks each step's criteria against the running site and git history, in order, and commit hooks that refuse a step's commit until it is green. The facilitator can read any attendee's progress with one command.
- A completed reference solution, committed step by step, for the debrief.
- A presentation with speaker notes in three parts: WordPress versus Astro + Payload, prerequisites, and the goal ([view it here](https://claude.ai/artifact/EMiU9Cwts4xJ32hqq5KjtN)), including a jargon section that names every Astro and Payload term attendees will meet, each beside its WordPress equivalent.
- A written glossary of the same terms for use during the hands-on and afterwards.
- A pre-session checklist that ends with the first gate, so every laptop is verified before the day.
- A facilitator guide with a minute-by-minute plan, the walk-around check, and known failure modes with their fixes.

## Cost

| Item | Time |
| --- | --- |
| Preparation (complete) | Done, one architect |
| Attendee preparation | About 10 minutes each, before the day |
| The session | 1.5 hours per attendee, plus 1 facilitator |
| Take-home (home page + deployment) | 2 to 3 hours per attendee, self-paced |
| Follow-up session, two weeks later | 45 minutes per attendee |

No new tooling or licences are required. Claude Code seats are already in place. Deployment of the portfolios can use free tiers.

## What we expect to get

- Every attendee leaves with a working portfolio site on the new stack: a Payload collection and global, and Astro pages, built from a WordPress specification with Claude Code, in under an hour.
- WordPress developers can contribute to Astro + Payload projects with support, rather than being blocked from them.
- A shared vocabulary between the WordPress and JavaScript developers, which reduces handover friction on mixed projects.
- Evidence, not impressions: the gate records which step each attendee reached.
- Concrete feedback on our Claude Code standards, folded back into claude-kit so every future project starts better configured.

## How we will know it worked

- On the day: every attendee green through step 5 (collection, seed, archive, detail, profile), read from the gate, plus a short exit survey on what mapped cleanly from WordPress and what did not.
- Two weeks later: a 45-minute follow-up where the portfolios are deployed and reviewed, and deployment is taught properly.
- Within the quarter: at least one client project on Astro + Payload with a former WordPress developer contributing.

## Risks and how they are handled

- **Setup time eating the session.** Mitigated by pre-verified laptops, a one-command setup, an automated environment check, the first gate run before the day, and an offline copy of dependencies on the day.
- **Learning a stack and a tool at once.** Mitigated by the WordPress-first framing, and by a jargon section in the presentation plus a written glossary, so no term is met for the first time mid-task. JavaScript developers are seated within reach of WordPress developers to help on request.
- **Skipping ahead or accepting work that does not run.** Mitigated by the gate: steps verify in order, and a step cannot be committed until its criteria pass on the attendee's own machine.
- **Over-reliance on the assistant.** Mitigated by the working habits enforced during the session: plan mode before any change, reading every diff before accepting it, and the facilitator asking individuals at random to explain a change they accepted. A change its author cannot explain is reverted and redone.

## Ask

No decision is required. This brief is for visibility. If management would like to observe the session or the follow-up, both are open.
