from typing import TypedDict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langchain_core.runnables import RunnableLambda

# Import retriever from vector.py
from vector import retriever



class SmartChildState(TypedDict):
    question: str
    chat_history: str
    retrieved_docs: str
    response: str


# Requires: pip install langchain-google-genai google-generativeai
# And set env var: GOOGLE_API_KEY=your_key_here

model = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0.3,     # safer, more factual
    max_output_tokens=800
)



template = """
You are **SmartChild AI Assistant**, specialized in child healthcare for Sri Lanka. 
You MUST answer based ONLY on trusted child health documents and guidelines provided in the context.

 Vaccination schedules (Sri Lanka EPI guidelines)  
 Child nutrition and growth standards  
 Official Ministry of Health / WHO child health references  
 Do NOT invent medical facts. If unsure, say you don’t know and recommend consulting a doctor or PHM.


 **Retrieved Knowledge:**  
{knowledge}
**Conversation History:**  
{chat_history}
**Parent’s Question:**  
{question}


**Answer Guidelines:**
1. Answer in **simple, clear language** parents can understand.  
2. Include **Sri Lankan vaccination/nutrition context** if relevant.  
3. Provide **next steps** (e.g., “consult MOH clinic”, “bring child’s vaccination card”).  
4. Always encourage **safe, professional consultation** for serious concerns.  

**Output Format:**

**Answer:**  
- Friendly explanation, accurate and concise.

**Next Steps (if applicable):**  
- Bullet points for parent/guardian actions.

Never give unsafe or unverified medical advice.
"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model



def run_retriever(state: SmartChildState) -> SmartChildState:
    retrieved = retriever.invoke(state["question"])
    return {**state, "retrieved_docs": retrieved}


def get_child_answer(state: SmartChildState) -> SmartChildState:
    result = chain.invoke({
        "knowledge": state["retrieved_docs"],
        "question": state["question"],
        "chat_history": state["chat_history"]
    })
    return {**state, "response": result}



graph = StateGraph(SmartChildState)
graph.add_node("retrieve", RunnableLambda(run_retriever))
graph.add_node("answer", RunnableLambda(get_child_answer))

graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "answer")
graph.add_edge("answer", END)

smartchild_chain = graph.compile()



def get_answer(question: str, chat_history: List[dict]) -> tuple[str, str]:
    """
    Main function called from API.
    - question: user input
    - chat_history: list of {role, content}
    Returns: (answer, retrieved_context)
    """
    chat_memory = "\n".join([
        f"{'User' if msg['role'] == 'user' else 'SmartChild'}: {msg['content']}"
        for msg in chat_history
    ])

    init_state: SmartChildState = {
        "question": question,
        "chat_history": chat_memory,
        "retrieved_docs": "",
        "response": ""
    }

    result = smartchild_chain.invoke(init_state)
    return result["response"], result["retrieved_docs"]
