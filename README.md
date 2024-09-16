# InterviewPrep
This application provides a platform for users to practice and prepare for interviews. It offers features like resume analysis, interview question generation, and feedback on responses.
Features
Resume Analysis: Uploads a resume and generates tailored interview questions based on its content.
Interview Practice: Provides a simulated interview environment with random questions.
Audio Recording: Records user's responses for playback and analysis.
Feedback: Offers suggestions for improvement based on the user's responses.
Technologies Used
Frontend: React
Backend: FastAPI
Cloud Platform: Azure
Azure Services: Azure Functions, Azure Cognitive Services (Speech Services, Text Analytics), Azure Blob Storage, Azure Cosmos DB (optional)

```
sequenceDiagram
    participant User
    participant Frontend as Frontend (Next.js)
    participant Backend as Backend (FastAPI)
    participant Templates as Question Templates
    participant OpenAI as Azure OpenAI

    User->>Frontend: Submit resume and job description
    Frontend->>Backend: POST /start_session
    Backend->>Templates: Select relevant questions
    Templates-->>Backend: Return selected questions
    Backend->>OpenAI: Generate initial feedback
    OpenAI-->>Backend: Return initial feedback
    Backend-->>Frontend: Return session ID, questions, and initial feedback
    Frontend->>User: Display first question and feedback

    loop Interview Process
        User->>Frontend: Submit answer
        Frontend->>Backend: POST /submit_answer
        Backend->>OpenAI: Evaluate answer
        OpenAI-->>Backend: Return evaluation
        Backend-->>Frontend: Return evaluation and next question
        Frontend->>User: Display evaluation and next question
    end

    Frontend->>Backend: POST /complete_interview
    Backend->>OpenAI: Generate final feedback
    OpenAI-->>Backend: Return final feedback
    Backend->>Frontend: Return final feedback
    Frontend->>User: Display final feedback
