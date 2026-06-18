import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiHeart, FiMessageSquare, FiShare2, FiSend } from 'react-icons/fi';

const Buzz = () => {
  const [posts, setPosts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [comments, setComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchPosts();
    api.get('/pim/employees').then(res => setEmployees(res.data)).catch(() => {});
  }, []);

  const fetchPosts = async () => {
    const { data } = await api.get('/buzz/posts');
    setPosts(data);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedEmp) return;
    const { data } = await api.post('/buzz/posts', { employee: selectedEmp, content: newPost });
    setPosts([data, ...posts]);
    setNewPost('');
  };

  const handleLike = async (postId) => {
    const emp = employees[0];
    if (!emp) return;
    await api.put(`/buzz/posts/like/${postId}`, { employeeId: emp._id });
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post?')) {
      await api.delete(`/buzz/posts/${postId}`);
      fetchPosts();
    }
  };

  const toggleComments = async (postId) => {
    if (showComments[postId]) {
      setShowComments({...showComments, [postId]: false});
      return;
    }
    const { data } = await api.get(`/buzz/posts/${postId}/comments`);
    setComments({...comments, [postId]: data});
    setShowComments({...showComments, [postId]: true});
  };

  const handleComment = async (postId) => {
    const text = commentTexts[postId];
    if (!text?.trim() || !selectedEmp) return;
    const { data } = await api.post(`/buzz/posts/${postId}/comments`, { employee: selectedEmp, content: text });
    setComments({...comments, [postId]: [...(comments[postId] || []), data]});
    setCommentTexts({...commentTexts, [postId]: ''});
    fetchPosts();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Create Post</h3></div>
        <div className="card-body">
          <div className="form-group">
            <select id="selectEmployee" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} style={{ marginBottom: 8 }}>
              <option value="">Select your profile</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.fullName}</option>)}
            </select>
            <textarea
              value={newPost} id="newPost"
              onChange={e => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCreatePost} disabled={!newPost.trim() || !selectedEmp}><FiSend /> Post</button>
        </div>
      </div>

      <div className="buzz-feed">
        {posts.map(post => (
          <div key={post._id} className="buzz-post-card">
            <div className="buzz-post-header">
              <div className="buzz-avatar">{getInitials(post.employee?.fullName)}</div>
              <div className="buzz-post-info">
                <h4>{post.employee?.fullName}</h4>
                <p>{new Date(post.createdAt).toLocaleString()}</p>
              </div>
              <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }} onClick={() => handleDeletePost(post._id)}>Delete</button>
            </div>
            <div className="buzz-post-content">{post.content}</div>
            {post.image && <div style={{ padding: '0 16px 12px' }}><img src={post.image} alt="post" style={{ maxWidth: '100%', borderRadius: 6 }} /></div>}
            <div className="buzz-post-actions">
              <div className="buzz-action" onClick={() => handleLike(post._id)}>
                <FiHeart style={{ color: post.likes?.length > 0 ? '#e74c3c' : 'inherit' }} /> {post.likeCount}
              </div>
              <div className="buzz-action" onClick={() => toggleComments(post._id)}>
                <FiMessageSquare /> {post.commentCount}
              </div>
              <div className="buzz-action"><FiShare2 /> {post.shares || 0}</div>
            </div>

            {showComments[post._id] && (
              <>
                <div style={{ padding: '0 16px 8px', maxHeight: 200, overflowY: 'auto' }}>
                  {(comments[post._id] || []).map(c => (
                    <div key={c._id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 }}>
                      <strong>{c.employee?.fullName}: </strong>{c.content}
                    </div>
                  ))}
                </div>
                <div className="buzz-comment-box">
                  <input
                    value={commentTexts[post._id] || ''}
                    onChange={e => setCommentTexts({...commentTexts, [post._id]: e.target.value})}
                    placeholder="Write a comment..."
                    onKeyDown={e => e.key === 'Enter' && handleComment(post._id)}
                  />
                  <button className="btn btn-sm btn-primary" onClick={() => handleComment(post._id)}><FiSend /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Buzz;
