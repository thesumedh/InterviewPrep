'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Square, Send, RefreshCw, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function InterviewPrepAppComponent() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [resume, setResume] = useState('')
  const [ragQuestions, setRagQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [speakingTips, setSpeakingTips] = useState('')
  const [interviewQuestions, setInterviewQuestions] = useState([
    "Tell me about yourself.",
    "What is your greatest strength?",
    "What is your greatest weakness?",
    "Why do you want to work for our company?",
    "Where do you see yourself in 5 years?"
  ])
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState('')
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const mediaRecorder = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      mediaRecorder.current.start()

      const audioChunks = []
      mediaRecorder.current.addEventListener("dataavailable", event => {
        audioChunks.push(event.data)
      })

      mediaRecorder.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks)
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        // Simulate transcription
        setTranscript("This is a simulated transcript of your answer to the question.")
        // Simulate AI analysis and generate speaking tips
        generateSpeakingTips()
      })

      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Unable to access microphone. Please check your browser settings.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const analyzeResume = async () => {
    // Simulating Azure RAG analysis
    const simulatedAzureResponse = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          questions: [
            "What's your most significant achievement in software development?",
            "Describe a time when you had to work with a difficult team member. How did you handle it?",
            "How do you approach learning new technologies in your field?",
            "Describe a situation where you had to lead a team through a challenging project.",
            "What strategies do you use for effective communication in a remote work environment?"
          ],
          score: 85
        })
      }, 2000)
    })

    setRagQuestions(simulatedAzureResponse.questions)
    setScore(simulatedAzureResponse.score)
    setCurrentQuestionIndex(0)
    setShowResults(false)
  }

  const getNextQuestion = () => {
    if (currentQuestionIndex < ragQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
    setTranscript('')
    setSpeakingTips('')
    setAudioURL('')
    setTextAnswer('')
  }

  const getNextInterviewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * interviewQuestions.length)
    setCurrentInterviewQuestion(interviewQuestions[randomIndex])
    setTranscript('')
    setSpeakingTips('')
    setAudioURL('')
    setTextAnswer('')
  }

  const generateSpeakingTips = () => {
    // Simulate AI analysis and generate speaking tips
    const tips = [
      "Great job maintaining a confident tone throughout your answer.",
      "Try to incorporate more specific examples to support your points.",
      "Your pace was good, but remember to pause occasionally for emphasis.",
      "Consider structuring your answer with a clear beginning, middle, and end.",
      "You did well in addressing the question directly. Keep up the focused approach."
    ]
    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 3)
    setSpeakingTips(randomTips.join("\n\n"))
  }

  useEffect(() => {
    getNextInterviewQuestion()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Interview Preparation App</h1>
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
          <TabsTrigger value="interview">Interview Practice</TabsTrigger>
        </TabsList>
        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resume Analysis
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Resume paste instructions</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Go to your resume, copy everything, and paste using Ctrl+C and Ctrl+V.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Paste your resume here" 
                value={resume} 
                onChange={(e) => setResume(e.target.value)}
              />
              <Button onClick={analyzeResume} disabled={!resume.trim()}>
                Analyze Resume
              </Button>
              {ragQuestions.length > 0 && !showResults && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold mb-2">Question {currentQuestionIndex + 1} of {ragQuestions.length}:</h3>
                  <p className="mb-2">{ragQuestions[currentQuestionIndex]}</p>
                  <div className="space-y-2">
                    <Button onClick={startRecording} disabled={isRecording}>
                      <Mic className="mr-2 h-4 w-4" /> Start Recording Answer
                    </Button>
                    {isRecording && (
                      <Button onClick={stopRecording} variant="destructive">
                        <Square className="mr-2 h-4 w-4" /> Stop Recording
                      </Button>
                    )}
                  </div>
                  <Textarea 
                    className="mt-2"
                    placeholder="Or type your answer here (optional)" 
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                  />
                </div>
              )}
              {audioURL && (
                <div>
                  <audio src={audioURL} controls className="w-full" />
                </div>
              )}
              {(transcript || textAnswer) && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold">Your Answer:</h3>
                  <p>{transcript || textAnswer}</p>
                </div>
              )}
              {speakingTips && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold mb-2">Speaking Tips:</h3>
                  <p className="whitespace-pre-line">{speakingTips}</p>
                </div>
              )}
              {ragQuestions.length > 0 && !showResults && (
                <Button onClick={getNextQuestion}>
                  {currentQuestionIndex < ragQuestions.length - 1 ? 'Next Question' : 'Finish'}
                </Button>
              )}
              {showResults && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold mb-2">Results:</h3>
                  <p>Your resume analysis score: {score}/100</p>
                  <h4 className="font-semibold mt-4 mb-2">Speaking Tips:</h4>
                  <p className="whitespace-pre-line">{speakingTips}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interview Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary rounded-md">
                <h3 className="font-semibold mb-2">Interview Question:</h3>
                <p className="mb-4">{currentInterviewQuestion}</p>
                <div className="space-y-2">
                  <Button onClick={startRecording} disabled={isRecording}>
                    <Mic className="mr-2 h-4 w-4" /> Start Recording
                  </Button>
                  {isRecording && (
                    <Button onClick={stopRecording} variant="destructive">
                      <Square className="mr-2 h-4 w-4" /> Stop Recording
                    </Button>
                  )}
                </div>
                <Textarea 
                  className="mt-2"
                  placeholder="Or type your answer here (optional)" 
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                />
              </div>
              {audioURL && (
                <div>
                  <audio src={audioURL} controls className="w-full" />
                </div>
              )}
              {(transcript || textAnswer) && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold">Your Answer:</h3>
                  <p>{transcript || textAnswer}</p>
                </div>
              )}
              {speakingTips && (
                <div className="mt-4 p-4 bg-secondary rounded-md">
                  <h3 className="font-semibold mb-2">Speaking Tips:</h3>
                  <p className="whitespace-pre-line">{speakingTips}</p>
                </div>
              )}
              <Button onClick={getNextInterviewQuestion}><RefreshCw className="mr-2 h-4 w-4" /> Next Question</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )

}


const handleResumeUpload = async (resumeFile) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);

  try {
      const response = await fetch('/upload-resume', {
          method: 'POST',
          body: formData
      });

      const data = await response.json();
      setInterviewQuestions(data.questions);
  } catch (error) {
      console.error('Error uploading resume:', error);
  }
};

