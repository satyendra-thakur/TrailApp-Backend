class UserModel {
  static build(data) {
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName || "",
      role: data.role || "user",
      isPremium: Boolean(data.isPremium),
      premiumUntil: data.premiumUntil || null,
      premiumFeatures: data.premiumFeatures || {
        offlineMaps: false,
        unlimitedTrails: false,
        advancedAnalytics: false
      },
      phone: data.phone || "",
      country: data.country || "",
      preferredLanguage: data.preferredLanguage || "en",
      bio: data.bio || "",
      photoUrl: data.photoUrl || "",
      emergencyContact: data.emergencyContact || "",
      touristMode: data.touristMode || {
        passportNumber: "",
        visaNumber: "",
        nationality: ""
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  static toPublic(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

module.exports = UserModel;
