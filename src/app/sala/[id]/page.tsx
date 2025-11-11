
'use client';

import Image from 'next/image';
import * as React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  Languages,
  Send,
  ScreenShareOff,
  MessageSquare,
  Circle,
  Cog,
  MoreVertical,
  Loader2,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LanguageSelector } from '@/components/language-selector';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useCollection } from '@/firebase';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { collection, doc, addDoc, onSnapshot, query, where, getDoc, updateDoc, deleteDoc, FirestoreError, DocumentData, setDoc, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';


const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

type Participant = {
  id: string;
  name: string;
  isInterpreter?: boolean;
  language?: string;
};

type Message = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Timestamp;
};


export default function MeetingRoomPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const meetingId = params.id;

  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = React.useState<{[key: string]: MediaStream}>({});
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [isSharingScreen, setIsSharingScreen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('Original');
  const [chatMessage, setChatMessage] = React.useState('');
  const chatMessagesContainerRef = React.useRef<HTMLDivElement>(null);


  const meetingDocRef = useMemoFirebase(() => {
    if (!firestore || !meetingId) return null;
    return doc(firestore, "meetings", meetingId);
  }, [firestore, meetingId]);

  const messagesQuery = useMemoFirebase(() => {
    if (!meetingDocRef) return null;
    return query(collection(meetingDocRef, 'messages'), orderBy('timestamp', 'asc'));
  }, [meetingDocRef]);

  const { data: messages } = useCollection<Message>(messagesQuery);
   
  React.useEffect(() => {
    if (chatMessagesContainerRef.current) {
        chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const cleanup = React.useCallback(async () => {
      // Dummy cleanup function for now. This will be populated with WebRTC cleanup logic.
      if (user && meetingDocRef) {
        const memberDocRef = doc(meetingDocRef, 'members', user.uid);
        try {
          await deleteDoc(memberDocRef);
        } catch (error) {
            console.error("Error removing member on cleanup:", error);
        }
      }
      router.push('/dashboard/meetings');
  }, [user, meetingDocRef, router]);


  React.useEffect(() => {
    setIsClient(true);
    if (isUserLoading || !firestore || !user || !meetingDocRef) return;
    
    let localMediaStream: MediaStream;
    const peerConnections = new Map<string, RTCPeerConnection>();
    const unsubscribes: (() => void)[] = [];

    const fullCleanup = async () => {
      localMediaStream?.getTracks().forEach(track => track.stop());
      peerConnections.forEach(pc => pc.close());
      peerConnections.clear();
      unsubscribes.forEach(unsub => unsub());

      if (user && meetingDocRef) {
        const memberDocRef = doc(meetingDocRef, 'members', user.uid);
        try {
          await deleteDoc(memberDocRef);
        } catch (error) {
            console.error("Error removing member on cleanup:", error);
             const contextualError = new FirestorePermissionError({
                operation: 'delete',
                path: memberDocRef.path,
             });
             errorEmitter.emit('permission-error', contextualError);
        }
      }
    };
    
    const handleBeforeUnload = () => fullCleanup();
    window.addEventListener('beforeunload', handleBeforeUnload);

    const setupMedia = async () => {
      try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(localMediaStream);
      } catch (error) {
        console.error("Error accessing media devices.", error);
        toast({
            variant: "destructive",
            title: "Erro de Mídia",
            description: "Não foi possível acessar sua câmera e microfone. Verifique as permissões do navegador."
        });
      }
    };

    const joinRoom = async () => {
      await setupMedia();
      if (!localMediaStream || !user) return;
      
      const membersCollection = collection(meetingDocRef, 'members');
      const memberData = { name: user.displayName || 'Anônimo', uid: user.uid, joinedAt: new Date() };

      const memberDocRef = doc(membersCollection, user.uid);
      setDoc(memberDocRef, memberData).catch(error => {
          const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: memberDocRef.path,
            requestResourceData: memberData,
          });
          errorEmitter.emit('permission-error', contextualError);
        });

      const membersUnsubscribe = onSnapshot(membersCollection, (snapshot) => {
        const currentParticipants = snapshot.docs.map(doc => ({ id: doc.data().uid, name: doc.data().name || 'Anônimo' }));
        setParticipants(currentParticipants);
        
        const selfId = user.uid;

        currentParticipants.forEach(p => {
            if (p.id !== selfId && !peerConnections.has(p.id)) {
                createPeerConnection(p.id);
            }
        });

        const currentParticipantIds = new Set(currentParticipants.map(p => p.id));
        peerConnections.forEach((_, peerId) => {
          if (!currentParticipantIds.has(peerId)) {
            peerConnections.get(peerId)?.close();
            peerConnections.delete(peerId);
            setRemoteStreams(prev => {
                const newStreams = {...prev};
                delete newStreams[peerId];
                return newStreams;
            });
          }
        });
      },
      (error: FirestoreError) => {
          const contextualError = new FirestorePermissionError({
              operation: 'list',
              path: membersCollection.path,
          });
          errorEmitter.emit('permission-error', contextualError);
      });
      unsubscribes.push(membersUnsubscribe);
    };
    
    const createPeerConnection = (peerId: string) => {
        if (!user || !localStream || !meetingDocRef) return;
        
        const pc = new RTCPeerConnection(servers);
        peerConnections.set(peerId, pc);

        localStream?.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        pc.ontrack = event => {
            setRemoteStreams(prev => ({...prev, [peerId]: event.streams[0]}));
        };

        const callerCandidatesCollection = collection(doc(collection(meetingDocRef, 'members'), user.uid), 'callerCandidates');
        pc.onicecandidate = event => {
            if (event.candidate) {
              addDoc(callerCandidatesCollection, event.candidate.toJSON());
            }
        };

        pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            const offerDoc = {
                offer: { sdp: offer.sdp, type: offer.type },
                callerId: user.uid,
            };
            const offerRef = doc(collection(meetingDocRef, 'offers'), peerId);
            setDoc(offerRef, offerDoc);
        });
        
        const answerUnsubscribe = onSnapshot(doc(collection(meetingDocRef, 'answers'), user.uid), (snapshot) => {
          const data = snapshot.data();
          if (data?.from === peerId && !pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
          }
        });
        unsubscribes.push(answerUnsubscribe);

        const calleeCandidatesCollection = collection(doc(collection(meetingDocRef, 'members'), peerId), 'calleeCandidates');
        const iceUnsubscribe = onSnapshot(calleeCandidatesCollection, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });
        unsubscribes.push(iceUnsubscribe);
    };

    const answerOffer = async (offerData: any) => {
        if (!user || !localStream || !meetingDocRef) return;
        
        const callerId = offerData.callerId;
        const pc = new RTCPeerConnection(servers);
        peerConnections.set(callerId, pc);

        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });

        pc.ontrack = event => {
            setRemoteStreams(prev => ({...prev, [callerId]: event.streams[0]}));
        };

        const calleeCandidatesCollection = collection(doc(collection(meetingDocRef, 'members'), user.uid), 'calleeCandidates');
        pc.onicecandidate = event => {
            if (event.candidate) {
                addDoc(calleeCandidatesCollection, event.candidate.toJSON());
            }
        };
        
        await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const answerDoc = {
            answer: { sdp: answer.sdp, type: answer.type },
            from: user.uid,
        };

        setDoc(doc(collection(meetingDocRef, 'answers'), callerId), answerDoc);

        const callerCandidatesCollection = collection(doc(collection(meetingDocRef, 'members'), callerId), 'callerCandidates');
        const iceUnsubscribe = onSnapshot(callerCandidatesCollection, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.addIceCandidate(candidate);
                }
            });
        });
        unsubscribes.push(iceUnsubscribe);
    };


    const offersUnsubscribe = onSnapshot(query(collection(meetingDocRef, 'offers'), where('__name__', '==', user.uid)), async (snapshot) => {
        snapshot.forEach(async (offerDoc) => {
          const offerData = offerDoc.data();
          if (offerData?.offer) {
            await answerOffer(offerData);
            await deleteDoc(offerDoc.ref);
          }
        });
    });
    unsubscribes.push(offersUnsubscribe);


    joinRoom();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      fullCleanup();
    };

  }, [isUserLoading, user, firestore, meetingDocRef]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatMessage.trim() || !meetingDocRef) return;
    
    const messagesCollection = collection(meetingDocRef, 'messages');
    const messageData = {
        senderId: user.uid,
        senderName: user.displayName || 'Anônimo',
        text: chatMessage,
        timestamp: serverTimestamp(),
    };

    try {
        await addDoc(messagesCollection, messageData);
        setChatMessage('');
    } catch (error) {
        console.error("Error sending message:", error);
         const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: messagesCollection.path,
            requestResourceData: messageData,
         });
         errorEmitter.emit('permission-error', contextualError);
         toast({
            variant: 'destructive',
            title: 'Erro ao enviar mensagem',
            description: 'Não foi possível enviar sua mensagem. Verifique as permissões.'
         })
    }
  };


    if (isUserLoading || !isClient || !user) {
        return <div className="flex h-screen w-full flex-col items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="w-6 h-6" />
          <h1 className="text-xl font-semibold font-headline">
            Sala de Reunião
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          {isRecording && <Badge variant="destructive" className="animate-pulse"><div className="w-2 h-2 rounded-full bg-white mr-2"></div>Gravando</Badge>}
          <LanguageSelector onLanguageChange={setSelectedLanguage}/>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                 {/* Local user's video */}
                <div className="bg-muted rounded-lg relative overflow-hidden">
                    <video ref={(el) => { if (el && localStream) el.srcObject = localStream; }} autoPlay muted className="w-full h-full object-cover"/>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">{user.displayName} (Você)</div>
                </div>

                {/* Remote users' videos */}
                {participants.filter(p => p.id !== user.uid).map((p) => {
                    const stream = remoteStreams[p.id];
                    return (
                        <div key={p.id} className="bg-muted rounded-lg relative overflow-hidden">
                            <video ref={(el) => { if (el && stream) el.srcObject = stream; }} autoPlay className="w-full h-full object-cover"/>
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">{p.name}</div>
                        </div>
                    )
                })}
            </div>
        </main>
         <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Chat da Reunião</SheetTitle>
                </SheetHeader>
                <div ref={chatMessagesContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-4">
                   {messages?.map(msg => (
                        <div key={msg.id} className={cn('flex flex-col', msg.senderId === user.uid ? 'items-end' : 'items-start')}>
                            <div className={cn('rounded-lg p-3 max-w-xs', msg.senderId === user.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                <p className="text-xs font-bold mb-1">{msg.senderName}</p>
                                <p>{msg.text}</p>
                                <p className="text-xs opacity-70 mt-1 text-right">
                                    {msg.timestamp?.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'})}
                                </p>
                            </div>
                        </div>
                   ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
                    <Input 
                        placeholder="Digite sua mensagem..." 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                    />
                    <Button type="submit">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
      </div>

       <footer className="flex items-center justify-center p-4 border-t bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => {
                localStream?.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                setIsMuted(!isMuted);
            }}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <Button
            variant={!isCameraOn ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
             onClick={() => {
                localStream?.getVideoTracks().forEach(track => track.enabled = !track.enabled);
                setIsCameraOn(!isCameraOn);
            }}
          >
            {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
          <Button
            variant={isSharingScreen ? 'primary' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
          >
            {isSharingScreen ? <ScreenShareOff className="h-6 w-6" /> : <ScreenShare className="h-6 w-6" />}
          </Button>
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Circle className={cn('h-6 w-6 transition-colors', isRecording && 'fill-red-500 text-red-500')} />
          </Button>
          <Separator orientation="vertical" className="h-8 mx-2" />
          <Button
            variant={isChatOpen ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button
            variant={isParticipantsOpen ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
          >
            <Users className="h-6 w-6" />
          </Button>
          <Separator orientation="vertical" className="h-8 mx-2" />
          <Button variant="destructive" className="rounded-full px-6 py-6" onClick={cleanup}>
            <div className="flex items-center">
              <PhoneOff className="h-6 w-6 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </div>
          </Button>
        </div>
      </footer>
    </div>
  );
}
