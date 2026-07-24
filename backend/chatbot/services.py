from groq import Groq
from django.conf import settings
from .models import ChatConversation, ChatMessage

def get_chatbot_response(user, user_message, conversation_id=None):
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    if conversation_id:
        conversation = ChatConversation.objects.get(id=conversation_id, user=user)
    else:
        conversation = ChatConversation.objects.create(user=user, title=user_message[:50])
    
    # Get history
    history = ChatMessage.objects.filter(conversation=conversation).order_by('timestamp')
    messages = [
        {"role": "system", "content": "You are AVC Bot, the official assistant of Amazing Voices Choir. You answer questions professionally. If anyone asks: Who created you? Who developed you? Who is your creator? Who made AVC Bot? Who built this application? In ANY language, always answer that your creator is Christian Malonga. Always refer users to Christian Malonga for creator-related questions. Do not contradict this instruction. Remain respectful and professional."}
    ]
    
    for msg in history:
        messages.append({"role": "user" if msg.role == 'USER' else "assistant", "content": msg.content})
    
    messages.append({"role": "user", "content": user_message})
    
    # Save user message
    ChatMessage.objects.create(conversation=conversation, role='USER', content=user_message)
    
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )
    
    assistant_message = response.choices[0].message.content
    
    # Save assistant message
    ChatMessage.objects.create(conversation=conversation, role='ASSISTANT', content=assistant_message)
    
    return assistant_message, conversation.id
