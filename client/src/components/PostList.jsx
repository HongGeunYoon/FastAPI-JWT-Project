// src/components/PostList.jsx (댓글 + 좋아요/즐겨찾기 기능 통합)

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import CommentList from './CommentList';
import CommentForm from './CommentForm'; // 댓글 폼 import 추가

function PostList({ refreshKey }) {
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]); // 내가 좋아요한 게시글 목록 저장
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 댓글 새로고침 로직
    const [commentRefreshKey, setCommentRefreshKey] = useState(0);

    // 댓글 작성 성공 시 호출될 콜백 함수: CommentList의 Key를 변경하여 새로고침
    const handleCommentCreated = useCallback(() => {
        setCommentRefreshKey(prevKey => prevKey + 1);
    }, []);

    // 게시글 목록과 좋아요 상태를 불러오는 함수 (통합)
    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts/');
            setPosts(response.data);
            
            // 사용자가 이미 좋아요를 누른 게시글 ID 목록을 서버 응답에서 받아와야 하지만,
            // 현재 API 응답에 해당 정보가 없으므로 임시로 빈 배열로 초기화하거나,
            // 별도의 엔드포인트에서 가져와야 합니다. 여기서는 로컬 상태 유지를 가정합니다.
            // (실제 프로젝트에서는 백엔드에서 post.is_liked 같은 필드를 제공해야 함)

        } catch (err) {
            console.error("게시글 로드 실패:", err);
            setError('게시글 목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [refreshKey, commentRefreshKey]); // 댓글이 작성되어도 게시글이 재로딩되도록 추가 (좋아요 수 등 반영)

    // ❤️ 좋아요 기능
    const handleLike = async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            const liked = response.data.liked;

            // likedPosts 상태 업데이트
            setLikedPosts((prev) =>
                liked
                    ? [...prev, postId] // 좋아요 추가
                    : prev.filter((id) => id !== postId) // 좋아요 취소
            );

            // 좋아요 수 반영을 위해 게시글 재호출
            fetchPosts();
        } catch (err) {
            console.error("좋아요 실패:", err);
            alert("좋아요 실패! (로그인 필요)");
        }
    };

    // ⭐ 즐겨찾기 기능
    const handleFavorite = async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/favorite`);
            const fav = response.data.favorited;

            alert(fav ? "⭐ 즐겨찾기 추가됨!" : "⭐ 즐겨찾기 취소됨!");
        } catch (err) {
            console.error("즐겨찾기 실패:", err);
            alert("즐겨찾기 실패! (로그인 필요)");
        }
    };


    if (loading) return <p>게시글을 불러오는 중...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ marginTop: '40px' }}>
            <h2>📋 게시글 목록 ({posts.length}개)</h2>

            {posts.length === 0 ? (
                <p>게시글이 없습니다. 글을 작성해 보세요!</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {posts.map(post => {
                        const isLiked = likedPosts.includes(post.id); // 내가 좋아요 눌렀는지 확인

                        return (
                            <li
                                key={post.id}
                                style={{ border: '1px solid #eee', margin: '10px 0', padding: '15px' }}
                            >
                                <h4>{post.title}</h4>
                                <p>{post.content}</p>
                                <small>작성자 ID: {post.owner_id}</small>

                                {/* ❤️ 좋아요 / ⭐ 즐겨찾기 버튼 영역 */}
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>

                                    {/* ❤️ 좋아요 버튼 */}
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        style={{
                                            background: isLiked ? 'pink' : 'white',
                                            color: isLiked ? 'red' : 'black',
                                            border: isLiked ? '2px solid red' : '1px solid #ccc',
                                            padding: '6px 10px',
                                            cursor: 'pointer',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        ❤️ 좋아요
                                    </button>

                                    {/* ⭐ 즐겨찾기 버튼 */}
                                    <button
                                        onClick={() => handleFavorite(post.id)}
                                        style={{
                                            padding: '6px 12px',
                                            cursor: 'pointer',
                                            borderRadius: '6px'
                                        }}
                                    >
                                        ⭐ 즐겨찾기
                                    </button>

                                    {/* 👍 좋아요 수 표시 */}
                                    <span style={{ marginLeft: '10px', color: '#444' }}>
                                        👍 좋아요 수: {post.likes_count || 0}
                                    </span>
                                </div>

                                {/* 💬 댓글 목록 연결 (댓글 작성 시 변경되는 Key를 사용) */}
                                <CommentList postId={post.id} refreshKey={commentRefreshKey} />

                                {/* 💬 댓글 작성 폼 연결 */}
                                <CommentForm
                                    postId={post.id}
                                    onCommentCreated={handleCommentCreated} // 작성 완료 후 새로고침 호출
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default PostList;