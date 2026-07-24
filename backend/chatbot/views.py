from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatConversation, ChatMessage
from .services import get_chatbot_response
from .serializers import ChatConversationSerializer, ChatMessageSerializer


class ChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        conversation_id = request.data.get('conversation_id')
        if not message:
            return Response({'detail': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        assistant_message, conversation_id = get_chatbot_response(request.user, message, conversation_id)
        return Response({'conversation_id': conversation_id, 'message': assistant_message})


class ChatHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = ChatConversation.objects.filter(user=request.user).order_by('-updated_at')
        data = ChatConversationSerializer(conversations, many=True).data
        return Response(data)
