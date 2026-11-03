# SmartUni.Ai - University Knowledge Data Layer

## Overview

This directory (`src/data/`) is the **authoritative knowledge layer** for SmartUni.Ai's CampusAI assistant. It contains structured, source-backed university information extracted from official institutional documents.

---

## Architecture

`
src/data/
+-- universityKnowledge.ts            # Master knowledge store (TypeScript)
+-- processed/
    +-- publicKnowledgeManifest.json  # Public-safe metadata (committed to git)
    +-- sanitizedStudentRecords.json  # Private student data (gitignored)
`

### Design Principles

1. **Single Source of Truth** - All AI answers about university programmes, fees, and eligibility come from this layer only.
2. **Source Attribution** - Every response from queryUniversityKnowledge() includes the sourceDocument field so the AI can cite its source.
3. **Separation of Concerns** - University public knowledge (programmes, fees) is separate from personal student records.
4. **Fallback Safety** - If a query does not match any official data, the system returns { found: false } and the AI explicitly tells the user it does not have that information.

---

## Source Documents

| File | Contents | Status |
|------|----------|--------|
| 2. Programme Page Content Requirement - School of FSIT data.docx | School overview, all FSIT programmes list, specializations | Ingested |
| 4. BCA(AI-ML) data.docx | BCA AI-ML programme details, curriculum, outcomes, careers | Ingested |
| 5. BCA (Cyber Security) data.docx | BCA Cyber Security programme details, curriculum, outcomes | Ingested |
| 7. BCA(IT) data.docx | BCA Information Technology programme details, curriculum | Ingested |
| Fees_Structure 26-27 data.docx | Official fee structure for all FSIT programmes, 2026-27 | Ingested |
| School of Future Skills & IT (3) data.xlsx | Extended school data and programme catalogue | Ingested |

Note: The raw .docx and .xlsx files are excluded from version control via .gitignore to protect proprietary institutional data.

---

## Key Exports

| Export | Type | Description |
|--------|------|-------------|
| FSIT_SCHOOL_INFO | UniversitySchoolInfo | School overview, faculty name, specializations |
| FSIT_PROGRAMMES_LIST | Object | Catalogued UG, PG, Certificate, Diploma programmes |
| PROGRAMME_KNOWLEDGE | ProgrammeDetail[] | Deep programme info: eligibility, curriculum, outcomes, careers |
| OFFICIAL_FEE_STRUCTURE_2026_27 | FeeStructureRecord[] | Full fee breakdown per course (annual, registration, uniform, bus) |
| queryUniversityKnowledge(query) | Function | RAG-style semantic query resolver |

---

## How to Add More Programmes

1. Add a new entry to the PROGRAMME_KNOWLEDGE array in universityKnowledge.ts, following the ProgrammeDetail interface.
2. Add the programme name to FSIT_PROGRAMMES_LIST under the correct category.
3. Add the fee record to OFFICIAL_FEE_STRUCTURE_2026_27 using the FeeStructureRecord interface.
4. Update the queryUniversityKnowledge() function keyword aliases if needed.

---

## Privacy and Security

- Raw source documents (.docx, .xlsx) are gitignored and never committed.
- sanitizedStudentRecords.json contains mock student data only - also gitignored.
- publicKnowledgeManifest.json contains only non-sensitive metadata and is safe to commit.
