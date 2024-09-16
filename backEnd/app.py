from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel, Field
from typing import List
import openai
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.textanalytics import TextAnalyticsClient
from loguru import logger

app = FastAPI()

# Azure OpenAI configuration
openai.api_type = "azure"
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with your Azure OpenAI API key
openai.api_base = "https://YOUR_OPENAI_ENDPOINT.openai.azure.com/"
openai.api_version = "2023-03-15-preview"

# Azure Cognitive Search configuration
search_service_name = "YOUR_SEARCH_SERVICE_NAME"  # Replace with your Azure Search Service name
index_name = "YOUR_INDEX_NAME"  # Replace with your Azure index name
search_api_key = "YOUR_SEARCH_API_KEY"  # Replace with your Azure Cognitive Search API key
endpoint = f"https://{search_service_name}.search.windows.net"

# Azure Text Analytics configuration
text_analytics_endpoint = "YOUR_TEXT_ANALYTICS_ENDPOINT"  # Replace with your Azure Text Analytics endpoint
text_analytics_key = "YOUR_TEXT_ANALYTICS_API_KEY"  # Replace with your Azure Text Analytics API key

search_client = SearchClient(
    endpoint=endpoint,
    index_name=index_name,
    credential=AzureKeyCredential(search_api_key)
)

text_analytics_client = TextAnalyticsClient(
    endpoint=text_analytics_endpoint,
    credential=AzureKeyCredential(text_analytics_key)
)

class ResumeJobDescription(BaseModel):
    resume: str = Field(..., min_length=100)  # Ensure resume is at least 100 characters
    job_description: str = Field(..., min_length=50)  # Ensure job description is at least 50 characters

@app.post("/analyze/")
async def analyze_rag(data: ResumeJobDescription):
    logger.info("Received request to analyze resume and job description.")

    resume = data.resume
    job_desc = data.job_description

    # Retrieve related documents using Azure Cognitive Search
    try:
        search_results = search_client.search(search_text=job_desc, top=5)
        retrieved_documents = [doc["content"] for doc in search_results]
    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve documents.")

    # Combine retrieved documents and resume to create context
    context = "\n".join(retrieved_documents) + "\n" + resume

    # Generate interview questions using Azure OpenAI
    prompt = f"Based on the following job description and resume, generate tailored interview questions:\n\n{context}"

    try:
        response = openai.Completion.create(
            engine="YOUR_DEPLOYMENT_NAME",  # Replace with your Azure OpenAI deployment name
            prompt=prompt,
            max_tokens=150,
            n=5,
            stop=None,
            temperature=0.7
        )
        questions = [choice['text'].strip() for choice in response['choices']]
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate questions.")

    # Analyze generated questions using Azure Text Analytics (optional)
    try:
        analysis_results = text_analytics_client.analyze_sentiment(documents=[{"id": "1", "text": question} for question in questions])
        sentiment_scores = [result.sentiment for result in analysis_results.documents]
    except Exception as e:
        logger.warning(f"Error analyzing questions: {str(e)}")
        sentiment_scores = [None] * len(questions)  # Assign None to sentiment scores if analysis fails

    # Combine questions and sentiment scores
    questions_with_sentiment = [{"question": question, "sentiment": sentiment_score} for question, sentiment_score in zip(questions, sentiment_scores)]

    logger.info("Successfully generated interview questions.")
    return {"questions": questions_with_sentiment}

@app.get("/")
async def root():
    return {"message": "RAG Interview Prep API is running"}
