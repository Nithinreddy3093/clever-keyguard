
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SubscriptionCallback = () => void;

export const useLeaderboardSubscription = (callback: SubscriptionCallback) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Create a channel for real-time updates
    const channel = supabase
      .channel('shadow-realm-leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'password_history'
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          callback();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to leaderboard updates');
          setSubscriptionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to leaderboard updates');
          setSubscriptionStatus('error');
        }
      });
      
    channelRef.current = channel;

    // Cleanup subscription
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [callback]);

  const reconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setSubscriptionStatus('connecting');
      
      // Attempt reconnection after delay
      setTimeout(() => {
        // Create a new channel
        const channel = supabase
          .channel('shadow-realm-leaderboard')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'password_history'
            },
            (payload) => {
              console.log("Realtime update received:", payload);
              callback();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to leaderboard updates');
              setSubscriptionStatus('connected');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('Failed to subscribe to leaderboard updates');
              setSubscriptionStatus('error');
            }
          });
          
        channelRef.current = channel;
      }, 2000);
    }
  };

  return {
    subscriptionStatus,
    reconnect
  };
};
