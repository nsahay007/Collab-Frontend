export function buildAuthorSnapshot(user, ventureName) {
  if (!user) {
    return {
      id: 'anonymous',
      name: 'Builder',
      role: 'Builder',
      skills: [],
      venture: ventureName || '',
    }
  }

  return {
    id: user.id || user._id || 'current-user',
    name: user.name || 'Builder',
    role: user.role === 'admin' ? 'Admin · Builder' : 'Startup Builder',
    skills: Array.isArray(user.skills) && user.skills.length ? user.skills : [],
    venture: ventureName || user.primaryCategory || '',
    email: user.showContactToTeam ? user.email : undefined,
  }
}

export function resolvePostAuthor(post, currentUserId, currentUserName) {
  if (post.author) {
    return {
      id: post.author.id || post.authorId,
      name: post.author.name || 'Builder',
      venture: post.venture || post.author.venture,
    }
  }

  if (post.authorId === currentUserId) {
    return {
      id: currentUserId,
      name: currentUserName || 'You',
      venture: post.venture,
    }
  }

  return {
    id: post.authorId,
    name: 'Builder',
    venture: post.venture,
  }
}

export function resolveProfileFromPost(post, currentUserId, currentUser, currentUserName) {
  if (post.author) {
    return post.author
  }

  if (post.authorId === currentUserId && currentUser) {
    return buildAuthorSnapshot(currentUser, post.venture)
  }

  return {
    id: post.authorId,
    name: 'Builder',
    role: 'Startup Builder',
    skills: [],
    venture: post.venture || '',
  }
}
