from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

app = FastAPI()

# Azure OpenAI configuration
openai.api_type = "azure"
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with your Azure OpenAI API key
openai.api_base = "https://YOUR_OPENAI_ENDPOINT.openai.azure.com/"
openai.api_version = "2023-03-15-preview"

# Azure Cognitive Search configuration
search_service_name = "YOUR_SEARCH_SERVICE_NAME"  # Replace with your Azure Search Service name
index_name = "YOUR_INDEX_NAME"  # Replace with your Azure index name
api_key = "YOUR_SEARCH_API_KEY"  # Replace with your Azure Cognitive Search API key
endpoint = f"https://{search_service_name}.search.windows.net"

search_client = SearchClient(endpoint=endpoint,
                             index_name=index_name,
                             credential=AzureKeyCredential(api_key))

class ResumeJobDescription(BaseModel):
    resume: str
    job_description: str

@app.post("/analyze/")
async def analyze_rag(data: ResumeJobDescription):
    resume = data.resume
    job_desc = data.job_description

    # Retrieve related documents using Azure Cognitive Search
    try:
        search_results = search_client.search(search_text=job_desc, top=5)
        retrieved_documents = [doc["content"] for doc in search_results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Error generating questions: {str(e)}")

    return {"questions": questions}


@app.get("/")
async def root():
    return {"message": "RAG Interview Prep API is running"}
