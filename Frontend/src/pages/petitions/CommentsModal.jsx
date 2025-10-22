import React, { useState, useEffect, useRef } from 'react';
import { Close, Send, Delete, Person } from '@mui/icons-material';
import petitionService from '../../services/petitionService';
import { getCurrentUserId, isAuthenticated } from '../../utils/auth';

const CommentsModal = ({ petition, isOpen, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  const currentUserId = getCurrentUserId();
  const userIsAuthenticated = isAuthenticated();
  const isPetitionCreator = petition?.creator?._id === currentUserId;

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && petition) {
      fetchComments();
    }
  }, [isOpen, petition]);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await petitionService.getComments(petition._id);
      if (response.success) {
        setComments(response.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!userIsAuthenticated) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (newComment.length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const response = await petitionService.addComment(petition._id, newComment.trim());
      
      if (response.success) {
        setComments(prev => [response.comment, ...prev]);
        setNewComment('');
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded(response.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await petitionService.deleteComment(petition._id, commentId);
      
      if (response.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        
        // Notify parent component
        if (onCommentAdded) {
          onCommentAdded(response.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const getRelativeTime = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Comments</h3>
            <p className="text-sm text-gray-600 mt-1">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Close className="text-gray-600" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-3">💬</div>
              <p className="text-gray-600 font-medium mb-1">No comments yet</p>
              <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => {
                const isOwnComment = comment.user?._id === currentUserId;
                const canDelete = isOwnComment || isPetitionCreator;

                return (
                  <div
                    key={comment._id}
                    className={`p-4 rounded-lg border transition-all ${
                      isOwnComment 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isOwnComment ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          <Person className="text-white" style={{ fontSize: '20px' }} />
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm truncate">
                              {comment.user?.name || 'Anonymous'}
                            </span>
                            {isOwnComment && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                You
                              </span>
                            )}
                            {comment.user?._id === petition.creator?._id && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                Creator
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-800 text-sm leading-relaxed break-words">
                            {comment.text}
                          </p>
                          
                          <span className="text-xs text-gray-500 mt-2 block">
                            {getRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex-shrink-0 p-1.5 hover:bg-red-100 rounded-full transition-colors group"
                          title="Delete comment"
                        >
                          <Delete className="text-gray-400 group-hover:text-red-600" style={{ fontSize: '18px' }} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </>
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                setError('');
              }}
              placeholder={userIsAuthenticated ? "Share your thoughts..." : "Login to comment"}
              disabled={!userIsAuthenticated || submitting}
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              rows="3"
              maxLength="500"
            />
            
            <button
              type="submit"
              disabled={!userIsAuthenticated || !newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-end"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send style={{ fontSize: '18px' }} />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>

          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{newComment.length}/500 characters</span>
            {!userIsAuthenticated && (
              <span className="text-red-500">Please login to comment</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;