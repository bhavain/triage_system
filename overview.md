
## **Overview**

Build a Customer Feedback Triage System that ingests feedback from multiple channels, categorizes it, and surfaces actionable insights. This assignment is designed to take 1-2 hours and evaluates your ability to make product-minded technical decisions, design useful data models, and build interfaces that solve real problems.

## **The Problem**

Your company receives customer feedback from multiple sources: support tickets, NPS surveys, app store reviews, and social mentions. Product and support teams are drowning in unstructured feedback and need a system to help them quickly identify what matters, spot trends, and route issues to the right people.

## **Requirements**

### **Backend API (Primary Focus)**

Design and build a REST API that supports the following capabilities:

**Feedback Ingestion**

* Accept feedback from multiple sources (support tickets, NPS surveys, app reviews, social mentions)  
* Handle different payload shapes per source while normalizing into a consistent internal model  
* Auto-categorize based on content (bug report, feature request, complaint, praise, question)

**Categorization Logic**

Implement simple rule-based or keyword-based categorization. For example:

* Mentions of "crash", "error", "broken" → Bug Report  
* Mentions of "wish", "would be nice", "should add" → Feature Request  
* Mentions of "love", "great", "amazing" → Praise  
* Low NPS score (0-6) → Complaint

You don't need ML here. Thoughtful heuristics are fine. Be prepared to discuss how you'd improve this over time.

**Retrieval and Insights**

Design endpoints that let users retrieve, filter, and analyze feedback. Think about what queries and aggregations would be most useful for the personas and scenarios described below.

### **Frontend Dashboard**

Build a dashboard that helps people triage and understand customer feedback. Rather than specifying exact views, we want you to decide what to build based on the following scenarios.

**Example Scenarios**

These are examples of jobs your dashboard should help accomplish:

* A PM starting their day wants to quickly see if anything urgent came in overnight that needs immediate attention  
* A support lead wants to understand what types of issues are driving the most ticket volume this week  
* An engineering manager wants to find all the bug reports related to a specific feature area  
* A founder preparing for a board meeting wants a high-level snapshot of customer sentiment trends

### **Technical Considerations**

**Data Modeling**: How you structure the feedback data will impact how useful the system is. Think about what queries the product team will run most often.

**Prioritization Logic**: What makes feedback "urgent"? Consider signals like customer value, issue severity, and frequency of similar reports. Be opinionated here.

**Flexibility vs Structure**: Different feedback sources have different shapes. How do you balance a normalized internal model against preserving source-specific details?

**Technology Stack**: Use whatever backend and frontend technologies you're most comfortable with.

## **What We're Looking For**

**Product Thinking**

* Did you identify the right problems to solve?  
* Does your data model capture what matters for decision-making?  
* Is your prioritization logic reasonable and explainable?

**Backend Design**

* API design that supports real workflows  
* Thoughtful categorization approach  
* Sensible handling of varied input formats

**Frontend Execution**

* Interface that's genuinely useful, not just functional  
* Good information hierarchy  
* Smooth interactions for common actions