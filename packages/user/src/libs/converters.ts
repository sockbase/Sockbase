import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument,
  SockbaseSpaceDocument,
  SockbaseApplicationOverviewDocument,
  SockbaseEventDocument,
  SockbaseSpaceHashDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketMeta,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument,
  SockbaseAccount,
  SockbaseInquiryDocument,
  SockbaseInquiryMetaDocument,
  SockbasePaymentDocument,
  SockbaseInformationDocument,
  SockbaseDocLinkDocument,
  SockbaseVoucherDocument,
  SockbaseVoucherCodeDocument
} from 'sockbase'

export const accountConverter: FirestoreDataConverter<SockbaseAccount> = {
  toFirestore: (userData: SockbaseAccount): DocumentData => ({
    name: userData.name,
    email: userData.email,
    birthday: userData.birthday,
    postalCode: userData.postalCode,
    address: userData.address,
    telephone: userData.telephone,
    gender: userData.gender
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseAccount => {
    const data = snapshot.data()
    return {
      name: data.name,
      email: data.email,
      birthday: new Date(data.birthday).getTime(),
      postalCode: data.postalCode,
      address: data.address,
      telephone: data.telephone,
      gender: data.gender
    }
  }
}

export const applicationHashIdConverter: FirestoreDataConverter<SockbaseApplicationHashIdDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      id: snapshot.id,
      userId: hashDoc.userId,
      applicationId: hashDoc.applicationId,
      hashId: hashDoc.hashId,
      paymentId: hashDoc.paymentId,
      spaceId: hashDoc.spaceId,
      organizationId: hashDoc.organizationId,
      eventId: hashDoc.eventId
    }
  }
}

export const applicationConverter: FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
      id: snapshot.id,
      hashId: app.hashId,
      userId: app.userId,
      eventId: app.eventId,
      spaceId: app.spaceId,
      circle: app.circle,
      overview: app.overview,
      unionCircleId: app.unionCircleId,
      petitCode: app.petitCode,
      paymentMethod: app.paymentMethod,
      remarks: app.remarks,
      createdAt: app.createdAt ? new Date(app.createdAt.seconds * 1000) : null,
      updatedAt: app.updatedAt ? new Date(app.updatedAt.seconds * 1000) : null
    }
  }
}

export const applicationMetaConverter: FirestoreDataConverter<SockbaseApplicationMeta> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationMeta => {
    const meta = snapshot.data()
    return {
      applicationStatus: meta.applicationStatus
    }
  }
}

export const applicationLinksConverter: FirestoreDataConverter<SockbaseApplicationLinksDocument> = {
  toFirestore: (links: SockbaseApplicationLinksDocument) => ({
    userId: links.userId,
    applicationId: links.applicationId,
    twitterScreenName: links.twitterScreenName,
    pixivUserId: links.pixivUserId,
    websiteURL: links.websiteURL,
    menuURL: links.menuURL
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationLinksDocument => {
    const links = snapshot.data()
    return {
      id: snapshot.id,
      userId: links.userId,
      applicationId: links.applicationId,
      twitterScreenName: links.twitterScreenName,
      pixivUserId: links.pixivUserId,
      websiteURL: links.websiteURL,
      menuURL: links.menuURL
    }
  }
}

export const paymentConverter: FirestoreDataConverter<SockbasePaymentDocument> =
  {
    toFirestore: () => ({}),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbasePaymentDocument => {
      const payment = snapshot.data()
      return {
        id: snapshot.id,
        hashId: payment.hashId,
        userId: payment.userId,
        paymentMethod: payment.paymentMethod,
        paymentAmount: payment.paymentAmount,
        totalAmount: payment.totalAmount,
        voucherAmount: payment.voucherAmount,
        voucherId: payment.voucherId,
        bankTransferCode: payment.bankTransferCode,
        applicationId: payment.applicationId,
        ticketId: payment.ticketId,
        paymentIntentId: payment.paymentIntentId,
        checkoutSessionId: payment.checkoutSessionId,
        status: payment.status,
        checkoutStatus: payment.checkoutStatus,
        cardBrand: payment.cardBrand,
        createdAt: payment.createdAt
          ? new Date(payment.createdAt.seconds * 1000)
          : null,
        updatedAt: payment.updatedAt
          ? new Date(payment.updatedAt.seconds * 1000)
          : null,
        purchasedAt: payment.purchasedAt
          ? new Date(payment.purchasedAt.seconds * 1000)
          : null
      }
    }
  }

export const eventConverter: FirestoreDataConverter<SockbaseEventDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseEventDocument => {
    const event = snapshot.data() as SockbaseEventDocument
    return {
      id: snapshot.id,
      name: event.name,
      websiteURL: event.websiteURL,
      venue: event.venue,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces
        .sort((a, b) => a.price - b.price),
      genres: event.genres,
      schedules: event.schedules,
      passConfig: event.passConfig,
      _organization: event._organization,
      permissions: {
        allowAdult: event.permissions.allowAdult ?? false,
        canUseBankTransfer: event.permissions.canUseBankTransfer ?? false,
        requirePetitCode: event.permissions.requirePetitCode ?? false
      },
      isPublic: event.isPublic
    }
  }
}

export const spaceConverter: FirestoreDataConverter<SockbaseSpaceDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseSpaceDocument => {
    const space = snapshot.data()
    return {
      id: snapshot.id,
      eventId: space.eventId,
      spaceGroupOrder: space.spaceGroupOrder,
      spaceOrder: space.spaceOrder,
      spaceName: space.spaceName
    }
  }
}

export const spaceHashConverter: FirestoreDataConverter<SockbaseSpaceHashDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseSpaceHashDocument => {
    const spaceHash = snapshot.data()
    return {
      id: snapshot.id,
      eventId: spaceHash.eventId
    }
  }
}

export const overviewConverter: FirestoreDataConverter<SockbaseApplicationOverviewDocument> = {
  toFirestore: (overview: SockbaseApplicationOverviewDocument) => ({
    userId: overview.userId,
    applicationId: overview.applicationId,
    description: overview.description,
    totalAmount: overview.totalAmount
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationOverviewDocument => {
    const overview = snapshot.data()
    return {
      id: snapshot.id,
      userId: overview.userId,
      applicationId: overview.applicationId,
      description: overview.description,
      totalAmount: overview.totalAmount
    }
  }
}

export const storeConverter: FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseStoreDocument => {
    const store = snapshot.data()
    return {
      id: snapshot.id,
      name: store.name,
      websiteURL: store.websiteURL,
      venue: store.venue,
      descriptions: store.descriptions,
      rules: store.rules,
      schedules: store.schedules,
      _organization: store._organization,
      permissions: {
        canUseBankTransfer: store.permissions.canUseBankTransfer ?? false,
        ticketUserAutoAssign: store.permissions.ticketUserAutoAssign ?? false
      },
      types: store.types,
      isPublic: store.isPublic
    }
  }
}

export const ticketConverter: FirestoreDataConverter<SockbaseTicketDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      paymentMethod: data.paymentMethod,
      paymentProductId: data.paymentProductId,
      createdAt: data.createdAt
        ? new Date(data.createdAt.seconds * 1000)
        : null,
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.seconds * 1000)
        : null,
      hashId: data.hashId,
      createdUserId: data.createdUserId,
      isStandalone: data.isStandalone ?? false
    }
  }
}

export const ticketMetaConverter: FirestoreDataConverter<SockbaseTicketMeta> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketMeta => {
    const data = snapshot.data()
    return {
      applicationStatus: data.applicationStatus
    }
  }
}

export const ticketUserConverter: FirestoreDataConverter<SockbaseTicketUserDocument> = {
  toFirestore: (data: SockbaseTicketUserDocument) => ({
    usableUserId: data.usableUserId
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketUserDocument => {
    const data = snapshot.data()
    return {
      hashId: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      usableUserId: data.usableUserId,
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null,
      isStandalone: data.isStandalone ?? false
    }
  }
}

export const ticketUsedStatusConverter: FirestoreDataConverter<SockbaseTicketUsedStatus> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketUsedStatus => {
    const data = snapshot.data()
    return {
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null
    }
  }
}

export const ticketHashIdConverter: FirestoreDataConverter<SockbaseTicketHashIdDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketHashIdDocument => {
    const data = snapshot.data()
    return {
      hashId: data.hashId,
      ticketId: data.ticketId,
      paymentId: data.paymentId
    }
  }
}

export const inquiryConverter: FirestoreDataConverter<SockbaseInquiryDocument> =
  {
    toFirestore: (inquiry: SockbaseInquiryDocument) => ({
      userId: inquiry.userId,
      inquiryType: inquiry.inquiryType,
      body: inquiry.body,
      createdAt: null,
      updatedAt: null
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryDocument => {
      const inquiry = snapshot.data()
      return {
        id: snapshot.id,
        userId: inquiry.userId,
        inquiryType: inquiry.inquiryType,
        body: inquiry.body,
        status: inquiry.status,
        createdAt: inquiry.createdAt
          ? new Date(inquiry.createdAt.seconds * 1000)
          : null,
        updatedAt: inquiry.updatedAt
          ? new Date(inquiry.updatedAt.seconds * 1000)
          : null
      }
    }
  }

export const inquiryMetaConverter: FirestoreDataConverter<SockbaseInquiryMetaDocument> =
  {
    toFirestore: () => ({}),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryMetaDocument => {
      const meta = snapshot.data()
      return {
        status: meta.status,
        createdAt: meta.createdAt
          ? new Date(meta.createdAt.seconds * 1000)
          : null,
        updatedAt: meta.updatedAt
          ? new Date(meta.updatedAt.seconds * 1000)
          : null
      }
    }
  }

export const informationConverter: FirestoreDataConverter<SockbaseInformationDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInformationDocument => {
    const info = snapshot.data()
    return {
      id: snapshot.id,
      title: info.title,
      body: info.body,
      updatedAt: info.updatedAt,
      isPublished: info.isPublished
    }
  }
}

export const docLinkConverter: FirestoreDataConverter<SockbaseDocLinkDocument> = {
  toFirestore: () => ({
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseDocLinkDocument => {
    const link = snapshot.data()
    return {
      id: snapshot.id,
      eventId: link.eventId,
      name: link.name,
      url: link.url,
      order: link.order
    }
  }
}

export const voucherConverter: FirestoreDataConverter<SockbaseVoucherDocument> = {
  toFirestore: () => ({
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseVoucherDocument => {
    const voucher = snapshot.data()
    return {
      id: snapshot.id,
      amount: voucher.amount,
      usedCount: voucher.usedCount,
      usedCountLimit: voucher.usedCountLimit,
      targetType: voucher.targetType,
      targetId: voucher.targetId,
      targetTypeId: voucher.targetTypeId,
      createdAt: new Date(voucher.createdAt.seconds * 1000),
      updatedAt: voucher.updatedAt ? new Date(voucher.updatedAt.seconds * 1000) : null
    }
  }
}

export const voucherCodeConverter: FirestoreDataConverter<SockbaseVoucherCodeDocument> = {
  toFirestore: () => ({
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseVoucherCodeDocument => {
    const voucher = snapshot.data()
    return {
      id: snapshot.id,
      voucherId: voucher.voucherId
    }
  }
}
