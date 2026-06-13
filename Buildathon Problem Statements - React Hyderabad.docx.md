

| PROBLEM STATEMENT  AI Hackathon 2025 *Building intelligent systems that transform the modern workplace* |
| :---- |

| TWO PROBLEM STATEMENTS  |  OPEN INNOVATION CHALLENGE |
| :---: |

| PS \#1 HR Cost Intelligence Engine Calendar-to-cost attribution via AI | PS \#2 Intelligent Slack Knowledge Base AI-powered knowledge layer on Slack |
| :---- | :---- |

Participants are expected to build a working prototype that addresses one of the following problem statements. Solutions will be evaluated on technical feasibility, innovation, user experience, and real-world applicability.

| PROBLEM STATEMENT 01 HR Cost Intelligence Engine *Know what your meetings are costing you — in real time.* |
| :---- |

**▌ OVERVIEW**

In most organisations today, employee calendars are packed with meetings — project syncs, client calls, cross-functional reviews, and ad hoc discussions. Yet no system connects this meeting activity back to project budgets or HR expenditure. Finance teams are left guessing how many person-hours are truly allocated to a given project, and at what cost.

This problem statement challenges participants to build an AI-powered HR Cost Intelligence Engine that ingests calendar data, intelligently attributes time to projects, and computes real-time HR expenditure per project — giving leadership a clear, automated view of where their people cost is actually going.

**▌ THE CORE PROBLEM**

| The Gap | There is no automated system that connects calendar meeting data → project attribution → HR cost. This gap leads to budget overruns, untracked utilisation, and invisible cross-project cost leakage. |
| :---: | :---- |

Specifically, organisations face three compounding challenges:

* Project-level HR costs are invisible. Payroll is tracked as a whole, but cost-per-project or cost-per-initiative is rarely computed.

* Manual timesheets are unreliable. Employees under-report, mis-attribute, or simply don't fill them in consistently.

* Calendar data is rich but untapped. Meeting titles, attendees, durations, and frequencies contain strong signals about project allocation — yet this data is never systematically analysed.

**▌ PRODUCT TO BUILD**

Participants must build a working application that:

| 1 | Calendar Integration Connects to Google Calendar and/or Outlook to pull meeting data for a defined time window. |
| :---: | :---- |
| **2** | **AI-Powered Project Attribution** Uses meeting context — titles, descriptions, attendees, recurrence patterns — to intelligently infer the project or workstream each meeting belongs to. |
| **3** | **Employee Cost Mapping** Maps each employee's designation or salary band to an estimated hourly cost, enabling automatic cost computation per meeting. |
| **4** | **Project Cost Dashboard** Displays a real-time breakdown of total HR expenditure per project, with drill-down by team, role, or time period. |
| **5** | **Anomaly Detection** Flags unusual patterns such as cost overruns, meetings with no clear project attribution, or employees spending disproportionate time on low-priority projects. |

**▌ SUCCESS METRICS**

| Metric | Current State | Expected Outcome |
| :---- | :---- | :---- |
| Project Attribution Accuracy | 0% — done manually or not at all | ≥ 85% AI attribution accuracy |
| Cost Visibility | Finance sees only total payroll | Real-time cost breakdown per project |
| Time to Insight | Weeks of manual consolidation | Dashboard updates within 24 hours |
| Coverage | Covers only billed or tracked projects | All calendar activity attributed |

**▌ CONSTRAINTS & ASSUMPTIONS**

* Salary / hourly rate data should be configurable by the admin (actual payroll integration is not required).

* Project taxonomy can be pre-seeded or auto-generated; participants may define a reasonable schema.

* The solution must handle employees who work across multiple projects simultaneously.

* The system should degrade gracefully when meeting context is ambiguous — surfacing a confidence score or flagging for human review.

* Data privacy must be considered; the solution should not expose individual salary details in shared views.

**▌ EVALUATION CRITERIA**

| Criteria | Weightage |
| :---- | :---: |
| Accuracy of AI project attribution | **30%** |
| Quality & usability of the cost dashboard | **25%** |
| Technical robustness & calendar integration depth | **20%** |
| Data privacy and access control design | **15%** |
| Innovation beyond the base requirement | **10%** |

| PROBLEM STATEMENT 02 Intelligent Slack Knowledge Base *Your company's knowledge — searchable, summarisable, and always at hand.* |
| :---- |

**▌ OVERVIEW**

Every organisation accumulates institutional knowledge — in documents, past decisions, team discussions, onboarding guides, policy files, and project artefacts. Yet this knowledge is scattered across drives, email threads, and chat histories. When employees need answers, they ask colleagues, dig through folders, or simply reinvent the wheel.

This problem statement challenges participants to build an AI-powered Knowledge Base layer directly inside Slack — a conversational intelligence system that allows any employee to upload documents, ask questions, request summaries, and retrieve information in natural language, without ever leaving their workspace.

**▌ THE CORE PROBLEM**

| The Gap | Organisational knowledge exists in silos — documents in drives, decisions in email, context in people's heads. There is no unified, conversational interface that makes this knowledge instantly accessible within the team's primary communication tool. |
| :---: | :---- |

Three interconnected problems drive the need for this solution:

* Knowledge is siloed. Critical information lives in PDFs, Notion pages, Google Docs, Slack messages, and email — with no single queryable layer on top.

* Context is lost at scale. As teams grow, tribal knowledge disappears with attrition. New joiners spend weeks ramping up on information that already exists but isn't findable.

* Interruption cost is high. Employees repeatedly ping colleagues for information that could be answered instantly if the right documents were searchable — breaking flow and compounding across teams.

**▌ PRODUCT TO BUILD**

Participants must build a Slack-native bot or app that:

| 1 | Document Upload & Ingestion Accepts PDFs, Word docs, URLs, plain text, and past Slack threads. Ingests and indexes them into the knowledge base. |
| :---: | :---- |
| **2** | **Natural Language Q\&A** Allows users to ask free-text questions and receive precise, cited answers grounded in the uploaded content. |
| **3** | **Document Summarisation** On command, provides concise summaries of any uploaded document, Slack thread, or content URL. |
| **4** | **Multi-turn Conversation** Supports follow-up questions in context, enabling a true conversational experience rather than one-shot retrieval. |
| **5** | **Scoped Knowledge Layers** Supports personal, team-level, and organisation-wide knowledge bases — with appropriate access controls for each scope. |
| **6** | **Auto-tagging & Organisation** Automatically tags and categorises uploaded content for easy browsing and retrieval by topic or project. |

**▌ SUCCESS METRICS**

| Metric | Current State | Expected Outcome |
| :---- | :---- | :---- |
| Answer Accuracy | N/A — no system exists today | ≥ 80% relevant, grounded answers |
| Time to Answer | Minutes to hours (searching manually) | \< 10 seconds via conversational query |
| Knowledge Scope | Single user only (personal files) | Personal \+ Team \+ Org, all in one bot |
| Content Types Supported | Docs in Drive only | PDF, DOCX, URL, chat history, plain text |

**▌ CONSTRAINTS & ASSUMPTIONS**

* The solution must be built as a Slack bot or Slack App with slash commands or at-mention triggers.

* All answers must be grounded in the uploaded knowledge base — the bot must not respond from general web knowledge alone.

* The system must clearly indicate when a question cannot be answered from available documents, rather than hallucinating.

* Access controls must ensure team documents are visible to team members only, and org-wide documents are accessible to all authenticated users.

* The solution should handle at minimum 50 concurrent documents in the knowledge base during the demo.

* Participants are free to use any vector database, embedding model, or LLM of their choice — the approach is technology-agnostic.

**▌ EVALUATION CRITERIA**

| Criteria | Weightage |
| :---- | :---: |
| Answer quality, accuracy, and groundedness | **30%** |
| Slack integration depth & UX fluency | **25%** |
| Knowledge scope & access control implementation | **20%** |
| Support for multi-content types and multi-turn Q\&A | **15%** |
| Scalability and production-readiness of the architecture | **10%** |

| General Submission Guidelines Each team must submit: (1) a working prototype or demo, (2) a short deck explaining the approach, (3) a README with setup instructions. Solutions will be judged by a panel of product, engineering, and business leaders. Participants may choose either problem statement. |
| ----- |

