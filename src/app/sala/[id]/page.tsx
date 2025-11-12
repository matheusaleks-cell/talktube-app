
'use client';

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
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  SheetClose,
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
import {
  useUser,
  useFirestore,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
  useCollection,
} from '@/firebase';
import { useRouter, useParams } from 'next/navigation';
import {
  collection,
  doc,
  addDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  deleteDoc,
  FirestoreError,
  setDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

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

type MediaDeviceInfo = {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput';
};

export default function MeetingRoomPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const meetingId = params.id;

  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [remoteStreams, setRemoteStreams] = React.useState<{
    [key: string]: MediaStream;
  }>({});
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(
    null
  );
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [isSharingScreen, setIsSharingScreen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState('Original');
  const [chatMessage, setChatMessage] = React.useState('');
  const chatMessagesContainerRef = React.useRef<HTMLDivElement>(null);
  const [pageLoading, setPageLoading] = React.useState(true);
  const [hasMediaPermission, setHasMediaPermission] = React.useState(true);
  const localVideoRef = React.useRef<HTMLVideoElement>(null);

  const peerConnections = React.useRef<Map<string, RTCPeerConnection>>(
    new Map()
  );
  const unsubscribes = React.useRef<(() => void)[]>([]);

  const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);

  const meetingDocRef = useMemoFirebase(
    () => (firestore && meetingId ? doc(firestore, 'meetings', meetingId) : null),
    [firestore, meetingId]
  );

  const messagesQuery = useMemoFirebase(
    () =>
      meetingDocRef
        ? query(collection(meetingDocRef, 'messages'), orderBy('timestamp', 'asc'))
        : null,
    [meetingDocRef]
  );

  const { data: messages } = useCollection<Message>(messagesQuery);

  React.useEffect(() => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop =
        chatMessagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const cleanup = React.useCallback(async () => {
    console.log('Running cleanup...');

    unsubscribes.current.forEach((unsub) => unsub());
    unsubscribes.current = [];
    
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);

    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    if (user && meetingDocRef && firestore) {
      const batch = writeBatch(firestore);
      const memberDocRef = doc(meetingDocRef, 'members', user.uid);
      
      const callerCandidatesQuery = query(collection(memberDocRef, 'callerCandidates'));
      const calleeCandidatesQuery = query(collection(memberDocRef, 'calleeCandidates'));

      try {
        const [callerSnaps, calleeSnaps] = await Promise.all([
            getDocs(callerCandidatesQuery),
            getDocs(calleeCandidatesQuery)
        ]);
        callerSnaps.forEach(doc => batch.delete(doc.ref));
        calleeSnaps.forEach(doc => batch.delete(doc.ref));
        batch.delete(memberDocRef);
        await batch.commit();
      } catch (error) {
        console.error('Error during Firestore cleanup batch:', error);
      }
    }

    router.push('/dashboard/meetings');
  }, [user, meetingDocRef, router, localStream, firestore]);
  
  const replaceTrack = React.useCallback((stream: MediaStream, kind: 'video' | 'audio') => {
      const newTrack = kind === 'video' ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
      if (newTrack) {
          peerConnections.current.forEach(pc => {
              const sender = pc.getSenders().find(s => s.track?.kind === kind);
              if (sender) {
                  sender.replaceTrack(newTrack);
              }
          });

          const currentStream = localStream ? localStream.clone() : new MediaStream();
          currentStream.getTracks().filter(t => t.kind === kind).forEach(t => {
            currentStream.removeTrack(t);
            t.stop();
          });
          currentStream.addTrack(newTrack);
          setLocalStream(currentStream);

          if (kind === 'video') {
            newTrack.onended = () => {
                if (isSharingScreen) {
                    toggleScreenShare(); // This will switch back to webcam
                }
            };
          }
      }
  }, [localStream, isSharingScreen]); // Add dependencies

  const toggleScreenShare = React.useCallback(async () => {
    if (isSharingScreen) {
        // Stop screen sharing and revert to webcam
        try {
            const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
            replaceTrack(webcamStream, 'video');
            setIsSharingScreen(false);
            toast({ title: 'Compartilhamento de tela encerrado.' });
        } catch (error) {
            console.error('Error switching back to webcam:', error);
            toast({ variant: 'destructive', title: 'Erro ao voltar para a câmera' });
        }
    } else {
        // Start screen sharing
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            replaceTrack(screenStream, 'video');
            setIsSharingScreen(true);
            toast({ title: 'Você está compartilhando sua tela.' });
        } catch (error) {
            console.error('Error starting screen share:', error);
            toast({
                variant: 'destructive',
                title: 'Compartilhamento de Tela Falhou',
                description: 'Não foi possível iniciar o compartilhamento de tela.',
            });
        }
    }
  }, [isSharingScreen, replaceTrack, toast]);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push(`/login?redirect=/sala/${meetingId}`);
      return;
    }
    if (!firestore || !meetingId) {
      setPageLoading(false);
      return;
    }

    setPageLoading(false);

    let localMediaStream: MediaStream | null = null;

    const setupMediaAndJoin = async () => {
      if (!firestore || !user || !meetingDocRef) return;

      try {
        localMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(localMediaStream);
        setHasMediaPermission(true);
      } catch (error) {
        console.error('Error accessing media devices.', error);
        setHasMediaPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à Mídia Negado',
          description:
            'Precisamos de acesso à sua câmera e microfone para entrar na sala.',
        });
        return;
      }
      
      const getDevices = async () => {
          try {
              const devices = await navigator.mediaDevices.enumerateDevices();
              const audio = devices.filter(device => device.kind === 'audioinput');
              const video = devices.filter(device => device.kind === 'videoinput');
              setAudioDevices(audio as MediaDeviceInfo[]);
              setVideoDevices(video as MediaDeviceInfo[]);
          } catch (error) {
              console.error("Error enumerating devices:", error);
          }
      };
      await getDevices();

      const memberDocRef = doc(meetingDocRef, 'members', user.uid);
      const memberData = {
        name: user.displayName || 'Anônimo',
        uid: user.uid,
        joinedAt: serverTimestamp(),
      };
      setDoc(memberDocRef, memberData).catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'create',
          path: memberDocRef.path,
          requestResourceData: memberData,
        });
        errorEmitter.emit('permission-error', contextualError);
      });

      const membersUnsubscribe = onSnapshot(
        collection(meetingDocRef, 'members'),
        (snapshot) => {
          const currentParticipantIds = new Set<string>();
          const currentParticipants = snapshot.docs.map((doc) => {
             currentParticipantIds.add(doc.id);
             return {
                id: doc.data().uid,
                name: doc.data().name || 'Anônimo',
                isInterpreter: doc.data().isInterpreter || false,
            }
          });
          setParticipants(currentParticipants);

          currentParticipants.forEach((p) => {
            if (p.id !== user.uid && !peerConnections.current.has(p.id)) {
              createPeerConnection(p.id, localMediaStream!);
            }
          });

          peerConnections.current.forEach((pc, peerId) => {
            if (!currentParticipantIds.has(peerId)) {
              pc.close();
              peerConnections.current.delete(peerId);
              setRemoteStreams((prev) => {
                const newStreams = { ...prev };
                delete newStreams[peerId];
                return newStreams;
              });
            }
          });
        }
      );
      unsubscribes.current.push(membersUnsubscribe);

      const offersUnsubscribe = onSnapshot(
        query(collection(meetingDocRef, 'offers'), where('calleeId', '==', user.uid)),
        async (snapshot) => {
          for (const offerDoc of snapshot.docs) {
            await answerOffer(offerDoc.data(), localMediaStream!);
            await deleteDoc(offerDoc.ref);
          }
        }
      );
      unsubscribes.current.push(offersUnsubscribe);
    };

    const createPeerConnection = (peerId: string, stream: MediaStream) => {
      if (!user || !stream || !meetingDocRef) return;

      const pc = new RTCPeerConnection(servers);
      peerConnections.current.set(peerId, pc);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
      };

      const callerCandidatesCollection = collection(doc(meetingDocRef, 'members', user.uid), 'callerCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(callerCandidatesCollection, event.candidate.toJSON());
        }
      };

      pc.createOffer()
        .then((offer) => {
          pc.setLocalDescription(offer);
          const offerPayload = { offer, callerId: user.uid, calleeId: peerId };
          const offerDocRef = doc(collection(meetingDocRef, 'offers'));
          setDoc(offerDocRef, offerPayload);
        });

      const answersUnsubscribe = onSnapshot(
        query(collection(meetingDocRef, 'answers'), where('callerId', '==', user.uid), where('from', '==', peerId)),
        async (snapshot) => {
          for (const docSnapshot of snapshot.docs) {
            const data = docSnapshot.data();
            if (data?.answer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
              await deleteDoc(docSnapshot.ref);
            }
          }
        }
      );
       unsubscribes.current.push(answersUnsubscribe);

      const iceUnsubscribe = onSnapshot(
        collection(doc(meetingDocRef, 'members', peerId), 'calleeCandidates'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        }
      );
       unsubscribes.current.push(iceUnsubscribe);
    };

    const answerOffer = async (offerData: any, stream: MediaStream) => {
      if (!user || !stream || !meetingDocRef) return;

      const pc = new RTCPeerConnection(servers);
      peerConnections.current.set(offerData.callerId, pc);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setRemoteStreams((prev) => ({...prev, [offerData.callerId]: event.streams[0]}));
      };

      const calleeCandidatesCollection = collection(doc(meetingDocRef, 'members', user.uid), 'calleeCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offerData.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const answerPayload = { answer, from: user.uid, callerId: offerData.callerId };
      const answerDocRef = doc(collection(meetingDocRef, 'answers'));
      setDoc(answerDocRef, answerPayload);

      const iceUnsubscribe = onSnapshot(
        collection(doc(meetingDocRef, 'members', offerData.callerId), 'callerCandidates'),
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            }
          });
        }
      );
       unsubscribes.current.push(iceUnsubscribe);
    };

    setupMediaAndJoin();
    window.addEventListener('beforeunload', cleanup);
    
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [isUserLoading, user, firestore, meetingId, router, toast, cleanup]);

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
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: messagesCollection.path,
        requestResourceData: messageData,
      });
      errorEmitter.emit('permission-error', contextualError);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar sua mensagem. Verifique as permissões.',
      });
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? 'Gravação Parada' : 'Gravação Iniciada',
      description: isRecording
        ? 'A gravação foi interrompida.'
        : 'A reunião está sendo gravada. (Simulação)',
    });
  };

  const handleShare = () => {
    const meetingUrl = window.location.href;
    navigator.clipboard.writeText(meetingUrl);
    toast({
      title: 'Link da Reunião Copiado!',
      description: 'Você pode compartilhar este link com os participantes.',
    });
  };

  if (pageLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!hasMediaPermission) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md text-center">
          <AlertTriangle className="h-6 w-6 mx-auto mb-4" />
          <AlertTitle className="text-xl font-bold">
            Acesso à Mídia é Necessário
          </AlertTitle>
          <AlertDescription>
            Para participar da reunião, você precisa permitir o acesso à sua
            câmera e microfone nas configurações do seu navegador. Por favor,
            atualize a página e conceda as permissões.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-6">
          Voltar ao Dashboard
        </Button>
      </div>
    );
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
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white mr-2"></div>Gravando
            </Badge>
          )}
          <LanguageSelector onLanguageChange={setSelectedLanguage} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            <div className="bg-muted rounded-lg relative overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
                {user?.displayName} (Você)
              </div>
            </div>

            {participants
              .filter((p) => p.id !== user?.uid)
              .map((p) => {
                const stream = remoteStreams[p.id];
                return (
                  <div
                    key={p.id}
                    className="bg-muted rounded-lg relative overflow-hidden"
                  >
                    {stream ? (
                      <video
                        ref={(el) => {
                          if (el && stream) el.srcObject = stream;
                        }}
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
                      {p.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </main>

        <Sheet
          open={isParticipantsOpen || isChatOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsParticipantsOpen(false);
              setIsChatOpen(false);
            }
          }}
        >
          <SheetContent className="flex flex-col">
            <SheetHeader>
              <SheetTitle>
                {isParticipantsOpen ? 'Participantes' : 'Chat da Reunião'}
              </SheetTitle>
            </SheetHeader>
            {isParticipantsOpen && (
              <div className="flex-1 overflow-y-auto space-y-4">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{p.name}{p.id === user?.uid && ' (Você)'}</span>
                    </div>
                    {p.isInterpreter && (
                      <Badge variant="secondary">
                        <UserCheck className="w-4 h-4 mr-1" /> Intérprete
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isChatOpen && (
              <>
                <div
                  ref={chatMessagesContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 pr-4"
                >
                  {messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col',
                        msg.senderId === user?.uid
                          ? 'items-end'
                          : 'items-start'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg p-3 max-w-xs',
                          msg.senderId === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-xs font-bold mb-1">
                          {msg.senderName}
                        </p>
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {msg.timestamp
                            ?.toDate()
                            .toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 border-t pt-4"
                >
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <Button type="submit">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            )}
             <SheetClose className="mt-4" />
          </SheetContent>
        </Sheet>
      </div>

      <footer className="flex items-center justify-center p-4 border-t bg-background">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          <Button
            variant={isMuted ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => {
              localStream?.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant={!isCameraOn ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => {
              localStream?.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
              setIsCameraOn(!isCameraOn);
            }}
          >
            {isCameraOn ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant={isSharingScreen ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleScreenShare}
          >
            {isSharingScreen ? (
              <ScreenShareOff className="h-6 w-6" />
            ) : (
              <ScreenShare className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={handleToggleRecording}
          >
            <Circle
              className={cn(
                'h-6 w-6 transition-colors',
                isRecording && 'fill-red-500 text-red-500'
              )}
            />
          </Button>

          <div className="hidden sm:flex border-l h-8 mx-2"></div>

          <Button
            variant={isChatOpen ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => {
              setIsChatOpen(true);
              setIsParticipantsOpen(false);
            }}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          <Button
            variant={isParticipantsOpen ? 'default' : 'secondary'}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={() => {
              setIsParticipantsOpen(true);
              setIsChatOpen(false);
            }}
          >
            <Users className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-12 w-12"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                <span>Compartilhar Link</span>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurações de Mídia</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="video-device" className="text-right">
                        Câmera
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione sua câmera" />
                        </SelectTrigger>
                        <SelectContent>
                          {videoDevices.map((device) => (
                            <SelectItem
                              key={device.deviceId}
                              value={device.deviceId}
                            >
                              {device.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="audio-device" className="text-right">
                        Microfone
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione seu microfone" />
                        </SelectTrigger>
                        <SelectContent>
                          {audioDevices.map((device) => (
                            <SelectItem
                              key={device.deviceId}
                              value={device.deviceId}
                            >
                              {device.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex border-l h-8 mx-2"></div>

          <Button
            variant="destructive"
            className="rounded-full px-6 py-6"
            onClick={cleanup}
          >
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

    