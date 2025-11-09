import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import officialService from '../../services/officialService';
import { useAuth } from '../../hooks/useAuth';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import BusinessIcon from '@mui/icons-material/Business';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

export default function OfficialResponseModal({ petitionId, isOpen, onClose, onAdded }) {
  const { user } = useAuth() || {};
  const isOfficial = user?.role === 'public-official' || user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]); // now holds grouped/combined entries
  const [error, setError] = useState(null);

  // simple form state & submit handlers to avoid ReferenceError
  const [form, setForm] = useState({ message: '', type: 'general_response', isPublic: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !petitionId) return;
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, petitionId]);

  const fetchResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await officialService.getOfficialResponses(petitionId, true);
      if (res && res.success) {
        const resp = res.responses || {};
        const raw = [];

        // main official response
        if (resp.officialResponse) {
          raw.push({
            message: resp.officialResponse,
            date: resp.reviewedAt || resp.verifiedAt || new Date().toISOString(),
            official: resp.reviewedBy || resp.verifiedBy || null,
            type: 'official_response',
            status: null
          });
        }

        // verification event — only include when it's a real verification (verified === true)
        // or when there is an explicit verification note (non-empty). Skip false/"marked invalid" noise.
        if (resp.verified === true || (resp.verificationNote && resp.verificationNote.trim())) {
          const msg = (resp.verificationNote && resp.verificationNote.trim())
            ? resp.verificationNote
            : 'Petition verified';
          raw.push({
            message: msg,
            date: resp.verifiedAt || resp.reviewedAt || new Date().toISOString(),
            official: resp.verifiedBy || resp.reviewedBy || null,
            type: 'verification',
            status: resp.verified === true ? 'verified' : null
          });
        }

        // timeline items
        if (Array.isArray(resp.timeline)) {
          resp.timeline.forEach(t => raw.push({
            message: t.note || '',
            date: t.date || t.createdAt || new Date().toISOString(),
            official: t.official || null,
            type: 'timeline',
            status: t.status || null
          }));
        }

        // sort newest first
        raw.sort((a, b) => new Date(b.date) - new Date(a.date));

        // group items that are close in time into a single combined card (within 60s)
        const grouped = [];
        for (const item of raw) {
          if (!grouped.length) {
            grouped.push({ date: item.date, items: [item] });
            continue;
          }
          const last = grouped[0]; // we keep grouped in newest-first order
          const diff = Math.abs(new Date(item.date) - new Date(last.date));
          if (diff <= 60000) {
            // merge into last group: keep group's date as the newest (already)
            last.items.push(item);
            // keep group's date as the newest item's date (already set from first)
          } else {
            // insert at front to maintain newest-first
            grouped.unshift({ date: item.date, items: [item] });
          }
        }

        // normalize grouped to newest-first order (already mostly handled)
        const normalized = grouped
          .map(g => ({
            date: g.date,
            items: g.items.sort((a, b) => new Date(b.date) - new Date(a.date)) // newest inside group first
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setResponses(normalized);
      } else {
        setResponses([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load official responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isOfficial) return setError('Only officials can post responses');
    if (!form.message.trim()) return setError('Message required');
    setSubmitting(true);
    setError(null);
    try {
      const res = await officialService.addOfficialResponse(petitionId, {
        message: form.message.trim(),
        type: form.type,
        isPublic: !!form.isPublic
      });
      if (res?.success) {
        await fetchResponses();
        onAdded?.(res.response);
        setForm({ message: '', type: 'general_response', isPublic: true });
      } else {
        setError(res?.message || 'Failed to send response');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const formatStatusLabel = (status) => {
    if (!status) return null;
    if (status === 'under_review' || status === 'Under Review') return 'Under Review';
    if (status === 'closed' || status === 'Closed') return 'Closed';
    if (status === 'verified' || status === 'verification') return 'Verified';
    if (status === 'unverified') return 'Marked Invalid';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!isOpen) return null;

  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1400
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: { xs: '92vw', sm: 720 }, maxHeight: '80vh', bgcolor: '#fff',
          borderRadius: 2, boxShadow: 24, zIndex: 1401, display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography variant="h6">Official Responses</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : error ? (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>
          ) : responses.length === 0 ? (
            <Typography color="text.secondary">No official response</Typography>
          ) : (
            responses.map((group, i) => {
              // determine if group contains a verification as highest-priority display
              const hasVerification = group.items.some(it => it.type === 'verification');
              const verificationItem = group.items.find(it => it.type === 'verification');
              // Ignore 'unverified' timeline/status entries for header label unless there's a real verification item.
              const statusFromGroup = (() => {
                if (verificationItem?.status) return verificationItem.status;
                // pick first non-'unverified' status from items (eg. under_review, closed, verified)
                const s = group.items.find(it => it.status && it.status !== 'unverified');
                return s?.status || null;
              })();
              const statusLabel = statusFromGroup ? formatStatusLabel(statusFromGroup) : null;

              // header info: use newest item in group
              const newest = group.items[0];

              // styling for verification card (if any)
              const isVerifiedCard = hasVerification && verificationItem?.status === 'verified';
              const cardBg = isVerifiedCard ? '#f0fdf4' : '#f8fafc';
              const borderLeft = hasVerification ? (isVerifiedCard ? '3px solid #10b981' : '3px solid #ef4444') : 'none';

              return (
                <Box key={`grp-${i}`} sx={{ mb: 2, p: 2, bgcolor: cardBg, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                      <Typography variant="caption" color="text.secondary">
                        {newest.official?.name ? newest.official.name : (newest.type === 'timeline' ? 'Timeline update' : 'Official')}
                        {' • '}
                        {new Date(newest.date).toLocaleString()}
                      </Typography>
                    </Box>
                    {statusLabel && (
                      <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#eef2ff', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e40af' }}>
                          {statusLabel}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 1, p: 1.25, borderLeft: borderLeft, borderRadius: 1 }}>
                    {/* Render each item inside the combined card */}
                    {group.items.map((it, idx) => {
                      if (it.type === 'verification') {
                        const VerifiedOrCancel = it.status === 'verified' ? VerifiedIcon : CancelIcon;
                        const vBg = it.status === 'verified' ? '#f0fdf4' : '#fff1f2';
                        return (
                          <Box key={`it-${idx}`} sx={{ mb: 1, p: 1, bgcolor: vBg, borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <VerifiedOrCancel sx={{ fontSize: 14, color: it.status === 'verified' ? '#10b981' : '#ef4444' }} />
                              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                Petition Verification
                              </Typography>
                            </Box>
                            {it.message && (
                              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#374151' }}>
                                {it.message}
                              </Typography>
                            )}
                          </Box>
                        );
                      }

                      // timeline or official_response
                      const icon = it.type === 'timeline' ? VerifiedIcon : ChatBubbleIcon;
                      const hasOfficialResponseInGroup = group.items.some(git => git.type === 'official_response');

                      return (
                        <Box key={`it-${idx}`} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            {React.createElement(icon, { sx: { fontSize: 14, color: it.type === 'timeline' ? '#f59e0b' : '#3b82f6' } })}
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {it.type === 'timeline' ? (it.status ? 'Status update' : 'Timeline note') : 'Official Response'}
                            </Typography>
                            {/* show individual official name & time for timeline entries */}
                            {it.type === 'timeline' && it.official?.name && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
                                • {it.official.name} • {new Date(it.date || it.createdAt || newest.date).toLocaleString()}
                              </Typography>
                            )}
                          </Box>

                          {/* If this timeline item contains a status change, show "previous -> new" */}
                          {it.type === 'timeline' && it.status ? (
                            <Box>
                              {(() => {
                                const prev = it.previousStatus || it.fromStatus || it.oldStatus || null;
                                const next = it.status;
                                return (
                                  <Typography variant="body2" sx={{ mt: 0.5, color: '#111827', fontWeight: 600 }}>
                                    {prev
                                      ? `${formatStatusLabel(prev)} → ${formatStatusLabel(next)}`
                                      : `Status changed to ${formatStatusLabel(next)}`}
                                  </Typography>
                                );
                              })()}

                              {/* Do not duplicate timeline message when an official_response is shown in same group */}
                              {!hasOfficialResponseInGroup && it.message && (
                                <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#374151' }}>
                                  {it.message}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            // Official response or plain timeline note (show message)
                            it.message && (
                              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap', fontStyle: 'italic', color: '#374151' }}>
                                {it.message}
                              </Typography>
                            )
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        <Divider />
      </Box>
    </>
  );
}