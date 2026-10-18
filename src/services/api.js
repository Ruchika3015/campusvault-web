const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';


/**
 * ================================================================
 * TOKEN FACTORY
 * ================================================================
 * api.js is a plain module — it cannot call React hooks.
 * AuthContext calls setTokenFactory() on mount and whenever the
 * Clerk session changes, providing an async function that returns
 * the current session token.
 *
 * apiRequest() calls this factory before every request so it always
 * uses a fresh, valid token.
 */

let _tokenFactory = () => Promise.resolve(null);

/**
 * Called by AuthContext to inject the Clerk token getter.
 * @param {() => Promise<string|null>} factory
 */
export function setTokenFactory(factory) {
  _tokenFactory = factory;
}


/**
 * ================================================================
 * LOW-LEVEL API REQUEST
 * ================================================================
 */

export async function apiRequest(
  path,
  options = {}
) {
  // Get the current Clerk session token (or demo/legacy token).
  // This is async because Clerk may need to refresh the token.
  const token = await _tokenFactory();


  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;


    const headers = {
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(isFormData
      ? {}
      : {
          'Content-Type':
            'application/json',
        }),

    ...(options.headers || {}),
  };


  const config = {
    ...options,
    headers,
  };


  let response;


  try {

    response =
      await fetch(
        `${BASE_URL}${path}`,
        config
      );

  } catch (error) {

    console.error(
      'API NETWORK ERROR:',
      error
    );


    throw {
      status: 0,

      message:
        'Exchange unavailable. Check your connection and try again.',

      data: null,
    };
  }


  let data = null;


  try {

    const text =
      await response.text();


    if (text) {

      try {

        data =
          JSON.parse(text);

      } catch {

        data = {
          message: text,
        };

      }

    }

  } catch (error) {

    console.error(
      'API RESPONSE ERROR:',
      error
    );

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      data?.details ||
      (
        response.status === 400
          ? 'Invalid request.'

          : response.status === 401
          ? 'Your session has expired. Please log in again.'

          : response.status === 403
          ? 'You are not authorized to perform this action.'

          : response.status === 404
          ? 'Requested resource was not found.'

          : response.status === 409
          ? 'This request conflicts with existing data.'

          : response.status === 500
          ? 'Server error. Please try again later.'

          : `Request failed with status ${response.status}.`
      );


    console.error(
      'API ERROR:',
      {
        path,
        status:
          response.status,
        data,
      }
    );


    throw {

      status:
        response.status,

      message,

      data,

    };
  }


  return data;
}


/* ================================================================
   API
================================================================ */

export const api = {


  // ================================================================
  // AUTH
  // ================================================================

  // POST /api/auth/sync — called after every Clerk sign-in.
  // Ensures the MongoDB profile exists and returns profileComplete state.
  syncProfile: () =>
    apiRequest('/api/auth/sync', { method: 'POST', body: JSON.stringify({}) }),

  // POST /api/profile/complete — submits the profile completion form.
  completeProfile: (payload) =>
    apiRequest('/api/profile/complete', {
      method: 'POST',
      body:   JSON.stringify(payload),
    }),

  // ── Kept for Android app compatibility (not used by web) ──────────────────
  register: (payload) =>
    apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  googleLogin: (payload) =>
    apiRequest('/api/auth/google', { method: 'POST', body: JSON.stringify(payload) }),

  forgotPassword: (email) =>
    apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyOtp: (email, otp) =>
    apiRequest('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  resetPassword: (resetToken, newPassword) =>
    apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) }),


  // ================================================================
  // USER PROFILE
  // Backend: /api/users
  // ================================================================

  getProfile: () =>
    apiRequest(
      '/api/users/me'
    ),


  updateProfile: (
    payload
  ) =>
    apiRequest(
      '/api/users/me',
      {
        method: 'PUT',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  uploadAvatar: (
    formData
  ) =>
    apiRequest(
      '/api/users/me/avatar',
      {
        method: 'POST',
        body: formData,
      }
    ),


  uploadResume: (
    formData
  ) =>
    apiRequest(
      '/api/users/me/resume',
      {
        method: 'POST',
        body: formData,
      }
    ),


  changePassword: (
    payload
  ) =>
    apiRequest(
      '/api/users/me/change-password',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  deleteAccount: (
    payload
  ) =>
    apiRequest(
      '/api/users/me',
      {
        method: 'DELETE',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  getMyStats: () =>
    apiRequest(
      '/api/users/me/stats'
    ),


  getMyGigs: () =>
    apiRequest(
      '/api/users/me/gigs'
    ),


  getMyReviews: () =>
    apiRequest(
      '/api/users/me/reviews'
    ),


  // ── Public Profiles ──────────────────────────────────────

  getUserById: (
    userId
  ) =>
    apiRequest(
      `/api/users/${userId}`
    ),


  getUserGigs: (
    userId
  ) =>
    apiRequest(
      `/api/users/${userId}/gigs`
    ),


  getUserReviews: (
    userId
  ) =>
    apiRequest(
      `/api/users/${userId}/reviews`
    ),


  // ================================================================
  // COLLEGES
  // Backend: /api/users/colleges
  // ================================================================

  getColleges: () =>
    apiRequest(
      '/api/users/colleges'
    ),


  // ================================================================
  // SKILLS (mapped to profile update — backend stores skills as [String] on User)
  // ================================================================

  getSkills: async () => {
    try {
      const user = await api.getProfile();
      const skills = Array.isArray(user?.skills) ? user.skills : [];
      return skills.map((s, idx) =>
        typeof s === 'string'
          ? { id: `skill-${idx}`, name: s, category: 'Technical', level: 'Intermediate' }
          : s
      );
    } catch {
      return [];
    }
  },

  addSkill: async (payload) => {
    const user = await api.getProfile();
    const currentSkills = Array.isArray(user?.skills) ? [...user.skills] : [];
    const skillName = typeof payload === 'string' ? payload.trim() : (payload.name || '').trim();
    if (skillName && !currentSkills.includes(skillName)) {
      currentSkills.push(skillName);
      await apiRequest('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ skills: currentSkills }),
      });
    }
    const skillObj = {
      id: `skill-${Date.now()}`,
      name: skillName,
      category: payload.category || 'Technical',
      level: payload.level || 'Intermediate',
    };
    return { data: skillObj, skill: skillObj };
  },

  updateSkill: async (id, payload) => {
    const user = await api.getProfile();
    const currentSkills = Array.isArray(user?.skills) ? [...user.skills] : [];
    const skillName = typeof payload === 'string' ? payload.trim() : (payload.name || '').trim();
    if (skillName && !currentSkills.includes(skillName)) {
      currentSkills.push(skillName);
      await apiRequest('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ skills: currentSkills }),
      });
    }
    const skillObj = {
      id: id || `skill-${Date.now()}`,
      name: skillName,
      category: payload.category || 'Technical',
      level: payload.level || 'Intermediate',
    };
    return { data: skillObj, skill: skillObj };
  },

  deleteSkill: async (skillIdOrName) => {
    const user = await api.getProfile();
    const currentSkills = Array.isArray(user?.skills) ? user.skills : [];
    const filtered = currentSkills.filter(
      (s, idx) => s !== skillIdOrName && `skill-${idx}` !== skillIdOrName && `skill-${s}` !== skillIdOrName
    );
    await apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify({ skills: filtered }),
    });
    return { success: true };
  },

  updateSkills: (skills) =>
    apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    }),

  getLinks: async () => {
    try {
      const user = await api.getProfile();
      const links = [];
      if (user?.github) links.push({ id: 'link-github', title: 'GitHub', url: user.github, category: 'GitHub' });
      if (user?.linkedin) links.push({ id: 'link-linkedin', title: 'LinkedIn', url: user.linkedin, category: 'LinkedIn' });
      if (user?.portfolio) links.push({ id: 'link-portfolio', title: 'Portfolio', url: user.portfolio, category: 'Portfolio' });
      if (user?.resumeUrl) links.push({ id: 'link-resume', title: 'Resume', url: user.resumeUrl, category: 'Resume' });
      return links;
    } catch {
      return [];
    }
  },

  addLink: async (payload) => {
    const type = (payload.category || payload.title || '').toLowerCase();
    const updates = {};
    if (type.includes('git')) updates.github = payload.url;
    else if (type.includes('linked')) updates.linkedin = payload.url;
    else if (type.includes('resume')) updates.resumeUrl = payload.url;
    else updates.portfolio = payload.url;
    await apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data: { id: `link-${Date.now()}`, ...payload } };
  },

  deleteLink: async (id) => {
    const updates = {};
    if (id === 'link-github') updates.github = '';
    if (id === 'link-linkedin') updates.linkedin = '';
    if (id === 'link-portfolio') updates.portfolio = '';
    if (id === 'link-resume') updates.resumeUrl = '';
    await apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { success: true };
  },

  // ================================================================
// PROJECTS — stored inside User profile
// ================================================================

getProjects: async () => {
  const user = await api.getProfile();

  const projects = Array.isArray(user?.projects)
    ? user.projects
    : [];

  return projects.map((project) => ({
    ...project,
    id: project.id || project._id,
  }));
},

addProject: async (payload) => {
  const user = await api.getProfile();

  const currentProjects = Array.isArray(user?.projects)
    ? [...user.projects]
    : [];

  const project = {
    id: `project-${Date.now()}`,
    name: String(payload?.name || "").trim(),
    description: String(payload?.description || "").trim(),
    technologies: Array.isArray(payload?.technologies)
      ? payload.technologies
      : [],
    github: String(payload?.github || "").trim(),
    link: String(payload?.link || "").trim(),
  };

  if (!project.name) {
    throw new Error("Project name is required.");
  }

  const nextProjects = [
    ...currentProjects,
    project,
  ];

  const updatedUser = await api.updateProfile({
    projects: nextProjects,
  });

  const savedProjects = Array.isArray(updatedUser?.projects)
    ? updatedUser.projects
    : nextProjects;

  const savedProject =
    savedProjects[savedProjects.length - 1];

  return {
    data: {
      ...savedProject,
      id:
        savedProject?.id ||
        savedProject?._id ||
        project.id,
    },
  };
},

updateProject: async (projectId, payload) => {
  const user = await api.getProfile();

  const currentProjects = Array.isArray(user?.projects)
    ? [...user.projects]
    : [];

  const updatedProjects = currentProjects.map(
    (project) => {
      const currentId = String(
        project.id || project._id
      );

      if (currentId !== String(projectId)) {
        return project;
      }

      return {
        ...project,
        name: String(
          payload?.name || ""
        ).trim(),
        description: String(
          payload?.description || ""
        ).trim(),
        technologies: Array.isArray(
          payload?.technologies
        )
          ? payload.technologies
          : [],
        github: String(
          payload?.github || ""
        ).trim(),
        link: String(
          payload?.link || ""
        ).trim(),
      };
    }
  );

  const updatedUser =
    await api.updateProfile({
      projects: updatedProjects,
    });

  const savedProjects =
    Array.isArray(updatedUser?.projects)
      ? updatedUser.projects
      : updatedProjects;

  const savedProject =
    savedProjects.find(
      (project) =>
        String(
          project.id || project._id
        ) === String(projectId)
    );

  return {
    data: {
      ...(savedProject || {}),
      id:
        savedProject?.id ||
        savedProject?._id ||
        projectId,
    },
  };
},

deleteProject: async (projectId) => {
  const user = await api.getProfile();

  const currentProjects = Array.isArray(
    user?.projects
  )
    ? user.projects
    : [];

  const updatedProjects =
    currentProjects.filter(
      (project) =>
        String(
          project.id || project._id
        ) !== String(projectId)
    );

  await api.updateProfile({
    projects: updatedProjects,
  });

  return {
    success: true,
  };
},

// ================================================================
// CERTIFICATIONS — stored inside User profile
// ================================================================

getCertifications: async () => {
  const user = await api.getProfile();

  const certifications = Array.isArray(
    user?.certifications
  )
    ? user.certifications
    : [];

  return certifications.map(
    (certification) => ({
      ...certification,
      id:
        certification.id ||
        certification._id,
      url:
        certification.url ||
        certification.credential_url ||
        "",
    })
  );
},

addCertification: async (payload) => {
  const user = await api.getProfile();
  const currentCertifications = Array.isArray(user?.certifications)
    ? [...user.certifications]
    : [];

  // Do not add a made-up "id" here. MongoDB creates the ID.
  const certification = {
    title: String(payload?.title || '').trim(),
    organization: String(payload?.organization || '').trim(),
    date: String(payload?.date || '').trim(),
    url: String(payload?.url || '').trim(),
  };

  if (!certification.title) {
    throw new Error('Certification title is required.');
  }

  const updatedUser = await api.updateProfile({
    certifications: [...currentCertifications, certification],
  });

  const savedCertifications = Array.isArray(updatedUser?.certifications)
    ? updatedUser.certifications
    : [];
  const savedCertification = savedCertifications[savedCertifications.length - 1];

  if (!savedCertification?._id && !savedCertification?.id) {
    throw new Error('The server did not return the saved certification ID.');
  }

  return {
    data: {
      ...savedCertification,
      id: String(savedCertification.id || savedCertification._id),
      url: savedCertification.url || '',
    },
  };
},

updateCertification: async (
  certificationId,
  payload
) => {
  const user = await api.getProfile();

  const currentCertifications =
    Array.isArray(user?.certifications)
      ? [...user.certifications]
      : [];

  const updatedCertifications =
    currentCertifications.map(
      (certification) => {
        const currentId = String(
          certification.id ||
          certification._id
        );

        if (
          currentId !==
          String(certificationId)
        ) {
          return certification;
        }

        return {
          ...certification,
          title: String(
            payload?.title || ""
          ).trim(),
          organization: String(
            payload?.organization || ""
          ).trim(),
          date: String(
            payload?.date || ""
          ).trim(),
          url: String(
            payload?.url || ""
          ).trim(),
        };
      }
    );

  const updatedUser =
    await api.updateProfile({
      certifications:
        updatedCertifications,
    });

  const savedCertifications =
    Array.isArray(
      updatedUser?.certifications
    )
      ? updatedUser.certifications
      : updatedCertifications;

  const savedCertification =
    savedCertifications.find(
      (certification) =>
        String(
          certification.id ||
          certification._id
        ) === String(certificationId)
    );

  return {
    data: {
      ...(savedCertification || {}),
      id:
        savedCertification?.id ||
        savedCertification?._id ||
        certificationId,
      url:
        savedCertification?.url ||
        "",
    },
  };
},

deleteCertification: async (
  certificationId
) => {
  const user = await api.getProfile();

  const currentCertifications =
    Array.isArray(
      user?.certifications
    )
      ? user.certifications
      : [];

  const updatedCertifications =
    currentCertifications.filter(
      (certification) =>
        String(
          certification.id ||
          certification._id
        ) !== String(certificationId)
    );

  await api.updateProfile({
    certifications:
      updatedCertifications,
  });

  return {
    success: true,
  };
},


  // ================================================================
  // GIGS (frontend calls these "Jugaads")
  // Backend: /api/gigs
  // ================================================================

  // ================================================================
// PAYMENTS
// Backend: /api/payment
// ================================================================

createPaymentOrder: (payload) =>
  apiRequest('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

getPaymentOrderStatus: (orderId) =>
  apiRequest(
    `/api/payment/order-status/${encodeURIComponent(orderId)}`
  ),
  
  createJugaad: (payload) => {
    const formatted = { ...payload };
    if (!formatted.skillsRequired && formatted.required_skills) {
      formatted.skillsRequired = formatted.required_skills;
    } else if (!formatted.skillsRequired && formatted.skill) {
      formatted.skillsRequired = typeof formatted.skill === 'string'
        ? formatted.skill.split(',').map((s) => s.trim()).filter(Boolean)
        : [String(formatted.skill)];
    }
    if (formatted.deadline && typeof formatted.deadline === 'string' && formatted.deadline.includes('T')) {
      formatted.deadline = formatted.deadline.split('T')[0];
    }
    if (formatted.amount && !formatted.budget) {
      formatted.budget = Number(formatted.amount);
    }
    return apiRequest('/api/gigs', {
      method: 'POST',
      body: JSON.stringify(formatted),
    });
  },

  createGig: (payload) => api.createJugaad(payload),

  getGigs: (params = '') => apiRequest(`/api/gigs${params ? (params.startsWith('?') ? params : `?${params}`) : ''}`),
  getAllGigs: (params = '') => api.getGigs(params),

  getDiscoveryFeed: () => api.getGigs(),

  getMyGigs: () => apiRequest('/api/users/me/gigs'),
  getMyJugaads: () => api.getMyGigs(),

  getGigById: (id) => apiRequest(`/api/gigs/${id}`),
  getGig: (id) => apiRequest(`/api/gigs/${id}`),
  getJugaad: (id) => apiRequest(`/api/gigs/${id}`),

  updateGig: (id, payload) =>
    apiRequest(`/api/gigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateJugaad: (id, payload) => api.updateGig(id, payload),

  deleteGig: (id) =>
    apiRequest(`/api/gigs/${id}`, {
      method: 'DELETE',
    }),
  deleteJugaad: (id) => api.deleteGig(id),


  // ── Gig Completion Flow ────────────────────────────────────

  submitWork: (
    gigId,
    payload
  ) =>
    apiRequest(
      `/api/gigs/${gigId}/submit-work`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  getCompletionOtp: (
    gigId
  ) =>
    apiRequest(
      `/api/gigs/${gigId}/completion-otp`
    ),


  completeGig: (
    gigId,
    otp
  ) =>
    apiRequest(
      `/api/gigs/${gigId}/complete`,
      {
        method: 'POST',

        body:
          JSON.stringify({ otp }),
      }
    ),


  // ================================================================
  // APPLICATIONS (replaces frontend's "Proposals")
  // Backend: /api/applications
  // ================================================================

  applyForGig: (gigId, payload) => {
    const formatted = {
      proposal: payload?.proposal || payload?.proposal_message || payload?.explanation || payload?.message || 'I am interested in helping with this gig.',
      expectedBudget: Number(payload?.expectedBudget ?? payload?.proposed_price ?? payload?.proposedPrice ?? payload?.amount ?? 0),
    };
    return apiRequest(`/api/applications/${gigId}`, {
      method: 'POST',
      body: JSON.stringify(formatted),
    });
  },

  getMyApplications: () =>
    apiRequest('/api/applications/my'),

  getGigApplications: (gigId) =>
    apiRequest(`/api/applications/gig/${gigId}`),

  updateApplicationStatus: (applicationId, status) =>
    apiRequest(`/api/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: typeof status === 'string' ? status.toLowerCase() : status }),
    }),

  withdrawApplication: (applicationId) =>
    api.withdrawProposal(applicationId),

  // ── Legacy Proposal Aliases (mapped to Applications) ──────

  submitProposal: (jugaadId, payload) => api.applyForGig(jugaadId, payload),

  getProposalsForJugaad: (jugaadId) =>
    apiRequest(`/api/applications/gig/${jugaadId}`),

  getMyProposals: () =>
    apiRequest('/api/applications/my'),

  getReceivedProposals: async () => {
    try {
      const myGigs = await api.getMyJugaads();
      const list = Array.isArray(myGigs)
        ? myGigs
        : myGigs?.gigs || myGigs?.data || [];
      if (!list.length) return [];
      const appPromises = list.map((gig) =>
        api.getGigApplications(gig._id || gig.id).catch(() => [])
      );
      const results = await Promise.all(appPromises);
      return results.flatMap((r) =>
        Array.isArray(r) ? r : r?.applications || r?.data || []
      );
    } catch {
      return [];
    }
  },


  acceptProposal: (
    applicationId
  ) =>
    apiRequest(
      `/api/applications/${applicationId}/status`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            status: 'accepted',
          }),
      }
    ),


  rejectProposal: (
    applicationId
  ) =>
    apiRequest(
      `/api/applications/${applicationId}/status`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            status: 'rejected',
          }),
      }
    ),


  withdrawProposal: (
    applicationId
  ) =>
    apiRequest(
      `/api/applications/${applicationId}/status`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            status: 'withdrawn',
          }),
      }
    ),


  // ================================================================
  // REVIEWS
  // Backend: /api/reviews
  // ================================================================

  createReview: (
    reviewedUser,
    payload
  ) =>
    apiRequest(
      `/api/reviews/${reviewedUser}`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  getReviewsForUser: (
    userId
  ) =>
    apiRequest(
      `/api/reviews/user/${userId}`
    ),


  getReviewsForGig: (
    gigId
  ) =>
    apiRequest(
      `/api/reviews/gig/${gigId}`
    ),


    // ================================================================
  // MESSAGES / CONVERSATIONS
  // Backend: /api/messages (inbox list) + /api/chat (send/receive)
  // ================================================================

  // GET /api/messages/inbox — list of conversations for the sidebar
  getConversations: () =>
    apiRequest(
      '/api/messages/inbox'
    ),

  // GET /api/chat/messages/:conversationId
  // Cache-busting prevents stale 304 responses while polling.
  getConversationMessages: (conversationId) =>
    apiRequest(
      `/api/chat/messages/${conversationId}?t=${Date.now()}`
    ),

  // POST /api/chat/conversation/:conversationId/message
  // Send a message inside a conversation.
  sendMessage: (
  conversationId,
  text,
  replyTo = null
) =>
  apiRequest(
    `/api/chat/conversation/${conversationId}/message`,
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        replyTo,
      }),
    }
  ),

    // POST /api/chat/message/:messageId/reaction
  // Add or remove a reaction on a message.
  toggleReaction: (
    messageId,
    emoji
  ) =>
    apiRequest(
      `/api/chat/message/${messageId}/reaction`,
      {
        method: 'POST',
        body: JSON.stringify({
          emoji,
        }),
      }
    ),
    
  // PUT /api/messages/:receiverId/read
  markConversationAsRead: (
    receiverId
  ) =>
    apiRequest(
      `/api/messages/${receiverId}/read`,
      {
        method: 'PUT',
        body: JSON.stringify({}),
      }
    ),

  // Create conversation
  createConversation: (
    payload
  ) =>
    apiRequest(
      '/api/chat/conversation',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  // Legacy chat-message alias
  getChatMessages: (
    conversationId
  ) =>
    apiRequest(
      `/api/chat/messages/${conversationId}?t=${Date.now()}`
    ),


  // ================================================================
  // NOTIFICATIONS
  // Backend: /api/notifications
  // ================================================================

  getNotifications: () =>
    apiRequest(
      '/api/notifications'
    ),


  getUnreadNotificationCount: () =>
    apiRequest(
      '/api/notifications/unread-count'
    ),


  markAllNotificationsRead: () =>
    apiRequest(
      '/api/notifications/read-all',
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  markNotificationRead: (
    id
  ) =>
    apiRequest(
      `/api/notifications/${id}/read`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ================================================================
  // COMMUNITIES
  // Backend: /api/communities
  // ================================================================

  getCommunities: () =>
    apiRequest(
      '/api/communities'
    ),


  getCommunity: (
    id
  ) =>
    apiRequest(
      `/api/communities/${id}`
    ),


  createCommunity: (
    payload
  ) =>
    apiRequest(
      '/api/communities',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  joinCommunity: (
    id
  ) =>
    apiRequest(
      `/api/communities/${id}/join`,
      {
        method: 'POST',

        body:
          JSON.stringify({}),
      }
    ),


  leaveCommunity: (
    id
  ) =>
    apiRequest(
      `/api/communities/${id}/leave`,
      {
        method: 'POST',

        body:
          JSON.stringify({}),
      }
    ),


  createCommunityPost: (
    communityId,
    payload
  ) =>
    apiRequest(
      `/api/communities/${communityId}/posts`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  getCommunityFeed: (
    communityId
  ) =>
    apiRequest(
      `/api/communities/${communityId}/feed`
    ),


  // ================================================================
  // FEEDBACK
  // Backend: /api/feedback
  // ================================================================

  submitFeedback: (
    payload
  ) =>
    apiRequest(
      '/api/feedback',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  getMyFeedback: () =>
    apiRequest(
      '/api/feedback/my'
    ),


  // ================================================================
  // STUBS — Features in frontend with no backend equivalent
  // These return empty/mock data to prevent runtime errors
  // ================================================================

  // Interest/Not-Interested (no backend endpoint)
  expressInterest: (
    jugaadId
  ) =>
    Promise.resolve({
      success: true,
      message: 'Interest noted',
    }),


  markNotInterested: (
    jugaadId
  ) =>
    Promise.resolve({
      success: true,
      message: 'Marked as not interested',
    }),


  // Counter-Offers (no backend endpoint)
  createCounterOffer: (
    proposalId,
    payload
  ) =>
    Promise.resolve({
      success: true,
      message: 'Counter-offer feature coming soon',
    }),


  getCounterOffers: (
    proposalId
  ) =>
    Promise.resolve([]),


  // Notification Preferences (no backend endpoint)
  getNotificationPreferences: () =>
    Promise.resolve({
      email: true,
      push: true,
      sms: false,
    }),


  updateNotificationPreferences: (
    preferences
  ) =>
    Promise.resolve({
      success: true,
      ...preferences,
    }),

};