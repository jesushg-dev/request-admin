/* eslint-disable */
const metadata = {
  models: {
    user: {
      name: 'User',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$User$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$User$modifiedBy,
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
          isOptional: true,
        },
        username: {
          name: 'username',
          type: 'String',
          isOptional: true,
        },
        email: {
          name: 'email',
          type: 'String',
          isOptional: true,
        },
        emailVerified: {
          name: 'emailVerified',
          type: 'DateTime',
          isOptional: true,
        },
        image: {
          name: 'image',
          type: 'String',
          isOptional: true,
        },
        password: {
          name: 'password',
          type: 'String',
        },
        role: {
          name: 'role',
          type: 'String',
          attributes: [{ name: '@default', args: [{ value: 'USER' }] }],
        },
        isTwoFactorEnabled: {
          name: 'isTwoFactorEnabled',
          type: 'Boolean',
          attributes: [{ name: '@default', args: [{ value: false }] }],
        },
        tenants: {
          name: 'tenants',
          type: 'Tenant',
          isDataModel: true,
          isArray: true,
          backLink: 'users',
        },
        accounts: {
          name: 'accounts',
          type: 'Account',
          isDataModel: true,
          isArray: true,
          backLink: 'user',
        },
        sessions: {
          name: 'sessions',
          type: 'Session',
          isDataModel: true,
          isArray: true,
          backLink: 'user',
        },
        twoFactorConfirmation: {
          name: 'twoFactorConfirmation',
          type: 'TwoFactorConfirmation',
          isDataModel: true,
          isOptional: true,
          backLink: 'user',
        },
        Authenticators: {
          name: 'Authenticators',
          type: 'Authenticator',
          isDataModel: true,
          isArray: true,
          backLink: 'user',
        },
        areaId: {
          name: 'areaId',
          type: 'String',
          isOptional: true,
          isForeignKey: true,
          relationField: 'area',
        },
        coordinatorId: {
          name: 'coordinatorId',
          type: 'String',
          isOptional: true,
          isForeignKey: true,
          relationField: 'coordinator',
        },
        area: {
          name: 'area',
          type: 'Area',
          isDataModel: true,
          isOptional: true,
          backLink: 'user',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'areaId' },
        },
        coordinator: {
          name: 'coordinator',
          type: 'User',
          isDataModel: true,
          isOptional: true,
          backLink: 'employees',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'coordinatorId' },
        },
        employees: {
          name: 'employees',
          type: 'User',
          isDataModel: true,
          isArray: true,
          backLink: 'coordinator',
        },
        requestAssignment: {
          name: 'requestAssignment',
          type: 'RequestAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'user',
        },
        userRole: {
          name: 'userRole',
          type: 'UserRole',
          isDataModel: true,
          isArray: true,
          backLink: 'user',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        username: {
          name: 'username',
          fields: ['username'],
        },
        email: {
          name: 'email',
          fields: ['email'],
        },
      },
    },
    tenant: {
      name: 'Tenant',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Tenant$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Tenant$modifiedBy,
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        logoUrl: {
          name: 'logoUrl',
          type: 'String',
          isOptional: true,
        },
        websiteUrl: {
          name: 'websiteUrl',
          type: 'String',
          isOptional: true,
        },
        title: {
          name: 'title',
          type: 'String',
          isOptional: true,
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        primaryColor: {
          name: 'primaryColor',
          type: 'String',
          isOptional: true,
        },
        secondaryColor: {
          name: 'secondaryColor',
          type: 'String',
          isOptional: true,
        },
        contactEmail: {
          name: 'contactEmail',
          type: 'String',
          isOptional: true,
        },
        contactPhone: {
          name: 'contactPhone',
          type: 'String',
          isOptional: true,
        },
        address: {
          name: 'address',
          type: 'String',
          isOptional: true,
        },
        users: {
          name: 'users',
          type: 'User',
          isDataModel: true,
          isArray: true,
          backLink: 'tenants',
        },
        accounts: {
          name: 'accounts',
          type: 'Account',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        sessions: {
          name: 'sessions',
          type: 'Session',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        verificationTokens: {
          name: 'verificationTokens',
          type: 'VerificationToken',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        passwordResetTokens: {
          name: 'passwordResetTokens',
          type: 'PasswordResetToken',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        twoFactorTokens: {
          name: 'twoFactorTokens',
          type: 'TwoFactorToken',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        twoFactorConfirmations: {
          name: 'twoFactorConfirmations',
          type: 'TwoFactorConfirmation',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        authenticators: {
          name: 'authenticators',
          type: 'Authenticator',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requirements: {
          name: 'requirements',
          type: 'Requirement',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        categoryRequirements: {
          name: 'categoryRequirements',
          type: 'CategoryRequirement',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        salesChannels: {
          name: 'salesChannels',
          type: 'SalesChannel',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        serviceTypes: {
          name: 'serviceTypes',
          type: 'ServiceType',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requirementServiceTypeAssociations: {
          name: 'requirementServiceTypeAssociations',
          type: 'RequirementServiceTypeAssociation',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requests: {
          name: 'requests',
          type: 'Request',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requirementComplianceTrackings: {
          name: 'requirementComplianceTrackings',
          type: 'RequirementComplianceTracking',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        documents: {
          name: 'documents',
          type: 'Document',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        areas: {
          name: 'areas',
          type: 'Area',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        categories: {
          name: 'categories',
          type: 'Category',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        subCategories: {
          name: 'subCategories',
          type: 'SubCategory',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requestAssignments: {
          name: 'requestAssignments',
          type: 'RequestAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        userRoles: {
          name: 'userRoles',
          type: 'UserRole',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        roles: {
          name: 'roles',
          type: 'Role',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        modules: {
          name: 'modules',
          type: 'Module',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        permissions: {
          name: 'permissions',
          type: 'Permission',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        rolePermissions: {
          name: 'rolePermissions',
          type: 'RolePermission',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requestStates: {
          name: 'requestStates',
          type: 'RequestState',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        clients: {
          name: 'clients',
          type: 'Client',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        identificationTypes: {
          name: 'identificationTypes',
          type: 'IdentificationType',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        documentAssignments: {
          name: 'documentAssignments',
          type: 'DocumentAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        requestTypes: {
          name: 'requestTypes',
          type: 'RequestType',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        forms: {
          name: 'forms',
          type: 'Form',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
        formSubmission: {
          name: 'formSubmission',
          type: 'FormSubmission',
          isDataModel: true,
          isArray: true,
          backLink: 'tenant',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    account: {
      name: 'Account',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'accounts',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        userId: {
          name: 'userId',
          type: 'String',
          isForeignKey: true,
          relationField: 'user',
        },
        type: {
          name: 'type',
          type: 'String',
        },
        provider: {
          name: 'provider',
          type: 'String',
        },
        providerAccountId: {
          name: 'providerAccountId',
          type: 'String',
        },
        refresh_token: {
          name: 'refresh_token',
          type: 'String',
          isOptional: true,
        },
        access_token: {
          name: 'access_token',
          type: 'String',
          isOptional: true,
        },
        expires_at: {
          name: 'expires_at',
          type: 'Int',
          isOptional: true,
        },
        token_type: {
          name: 'token_type',
          type: 'String',
          isOptional: true,
        },
        scope: {
          name: 'scope',
          type: 'String',
          isOptional: true,
        },
        id_token: {
          name: 'id_token',
          type: 'String',
          isOptional: true,
        },
        session_state: {
          name: 'session_state',
          type: 'String',
          isOptional: true,
        },
        refresh_token_expires_in: {
          name: 'refresh_token_expires_in',
          type: 'Int',
          isOptional: true,
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          backLink: 'accounts',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        provider_providerAccountId: {
          name: 'provider_providerAccountId',
          fields: ['provider', 'providerAccountId'],
        },
      },
    },
    session: {
      name: 'Session',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'sessions',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        sessionToken: {
          name: 'sessionToken',
          type: 'String',
        },
        userId: {
          name: 'userId',
          type: 'String',
          isForeignKey: true,
          relationField: 'user',
        },
        expires: {
          name: 'expires',
          type: 'DateTime',
        },
        currentTenantId: {
          name: 'currentTenantId',
          type: 'String',
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          backLink: 'sessions',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        sessionToken: {
          name: 'sessionToken',
          fields: ['sessionToken'],
        },
      },
    },
    verificationToken: {
      name: 'VerificationToken',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'verificationTokens',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        email: {
          name: 'email',
          type: 'String',
        },
        token: {
          name: 'token',
          type: 'String',
        },
        expires: {
          name: 'expires',
          type: 'DateTime',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        token: {
          name: 'token',
          fields: ['token'],
        },
        email_token: {
          name: 'email_token',
          fields: ['email', 'token'],
        },
      },
    },
    passwordResetToken: {
      name: 'PasswordResetToken',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'passwordResetTokens',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        email: {
          name: 'email',
          type: 'String',
        },
        token: {
          name: 'token',
          type: 'String',
        },
        expires: {
          name: 'expires',
          type: 'DateTime',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        token: {
          name: 'token',
          fields: ['token'],
        },
        email_token: {
          name: 'email_token',
          fields: ['email', 'token'],
        },
      },
    },
    twoFactorToken: {
      name: 'TwoFactorToken',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'twoFactorTokens',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        email: {
          name: 'email',
          type: 'String',
        },
        token: {
          name: 'token',
          type: 'String',
        },
        expires: {
          name: 'expires',
          type: 'DateTime',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        token: {
          name: 'token',
          fields: ['token'],
        },
        email_token: {
          name: 'email_token',
          fields: ['email', 'token'],
        },
      },
    },
    twoFactorConfirmation: {
      name: 'TwoFactorConfirmation',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'twoFactorConfirmations',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        userId: {
          name: 'userId',
          type: 'String',
          isForeignKey: true,
          relationField: 'user',
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          backLink: 'twoFactorConfirmation',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        userId: {
          name: 'userId',
          fields: ['userId'],
        },
      },
    },
    authenticator: {
      name: 'Authenticator',
      fields: {
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'authenticators',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        userId: {
          name: 'userId',
          type: 'String',
          isForeignKey: true,
          relationField: 'user',
        },
        providerAccountId: {
          name: 'providerAccountId',
          type: 'String',
        },
        credentialPublicKey: {
          name: 'credentialPublicKey',
          type: 'String',
        },
        counter: {
          name: 'counter',
          type: 'Int',
        },
        credentialDeviceType: {
          name: 'credentialDeviceType',
          type: 'String',
        },
        credentialBackedUp: {
          name: 'credentialBackedUp',
          type: 'Boolean',
        },
        transports: {
          name: 'transports',
          type: 'String',
          isOptional: true,
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          backLink: 'Authenticators',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        userId_providerAccountId: {
          name: 'userId_providerAccountId',
          fields: ['userId', 'providerAccountId'],
        },
      },
    },
    requirement: {
      name: 'Requirement',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Requirement$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Requirement$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requirements',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
        },
        categoryRequirementId: {
          name: 'categoryRequirementId',
          type: 'String',
          isOptional: true,
          isForeignKey: true,
          relationField: 'category',
        },
        onlyRequireInNewClients: {
          name: 'onlyRequireInNewClients',
          type: 'Boolean',
          attributes: [{ name: '@default', args: [{ value: false }] }],
        },
        requirementComplianceTracking: {
          name: 'requirementComplianceTracking',
          type: 'RequirementComplianceTracking',
          isDataModel: true,
          isArray: true,
          backLink: 'requirement',
        },
        requirementServiceTypeAssociation: {
          name: 'requirementServiceTypeAssociation',
          type: 'RequirementServiceTypeAssociation',
          isDataModel: true,
          isArray: true,
          backLink: 'requirement',
        },
        category: {
          name: 'category',
          type: 'CategoryRequirement',
          isDataModel: true,
          isOptional: true,
          backLink: 'requirements',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'categoryRequirementId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    categoryRequirement: {
      name: 'CategoryRequirement',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$CategoryRequirement$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$CategoryRequirement$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'categoryRequirements',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        requirements: {
          name: 'requirements',
          type: 'Requirement',
          isDataModel: true,
          isArray: true,
          backLink: 'category',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    salesChannel: {
      name: 'SalesChannel',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$SalesChannel$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$SalesChannel$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'salesChannels',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        serviceType: {
          name: 'serviceType',
          type: 'ServiceType',
          isDataModel: true,
          isArray: true,
          backLink: 'salesChannel',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    serviceType: {
      name: 'ServiceType',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$ServiceType$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$ServiceType$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'serviceTypes',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        salesChannelId: {
          name: 'salesChannelId',
          type: 'String',
          isForeignKey: true,
          relationField: 'salesChannel',
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        acceptsNewClients: {
          name: 'acceptsNewClients',
          type: 'Boolean',
          isOptional: true,
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          isArray: true,
          backLink: 'serviceType',
        },
        requirementServiceTypeAssociation: {
          name: 'requirementServiceTypeAssociation',
          type: 'RequirementServiceTypeAssociation',
          isDataModel: true,
          isArray: true,
          backLink: 'serviceType',
        },
        salesChannel: {
          name: 'salesChannel',
          type: 'SalesChannel',
          isDataModel: true,
          backLink: 'serviceType',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'salesChannelId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    requirementServiceTypeAssociation: {
      name: 'RequirementServiceTypeAssociation',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequirementServiceTypeAssociation$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequirementServiceTypeAssociation$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requirementServiceTypeAssociations',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        requirementId: {
          name: 'requirementId',
          type: 'String',
          isForeignKey: true,
          relationField: 'requirement',
        },
        serviceTypeId: {
          name: 'serviceTypeId',
          type: 'String',
          isForeignKey: true,
          relationField: 'serviceType',
        },
        requirement: {
          name: 'requirement',
          type: 'Requirement',
          isDataModel: true,
          backLink: 'requirementServiceTypeAssociation',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requirementId' },
        },
        serviceType: {
          name: 'serviceType',
          type: 'ServiceType',
          isDataModel: true,
          backLink: 'requirementServiceTypeAssociation',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'serviceTypeId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    request: {
      name: 'Request',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Request$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Request$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requests',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        serviceTypeId: {
          name: 'serviceTypeId',
          type: 'String',
          isForeignKey: true,
          relationField: 'serviceType',
        },
        clientId: {
          name: 'clientId',
          type: 'String',
          isForeignKey: true,
          relationField: 'client',
        },
        issueSubject: {
          name: 'issueSubject',
          type: 'String',
          isOptional: true,
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        priority: {
          name: 'priority',
          type: 'String',
          isOptional: true,
        },
        closedAt: {
          name: 'closedAt',
          type: 'DateTime',
          isOptional: true,
        },
        closedBy: {
          name: 'closedBy',
          type: 'String',
          isOptional: true,
        },
        closedComment: {
          name: 'closedComment',
          type: 'String',
          isOptional: true,
        },
        formSubmissionId: {
          name: 'formSubmissionId',
          type: 'Int',
          isOptional: true,
          isForeignKey: true,
          relationField: 'formSubmission',
        },
        formSubmission: {
          name: 'formSubmission',
          type: 'FormSubmission',
          isDataModel: true,
          isOptional: true,
          backLink: 'request',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'formSubmissionId' },
        },
        serviceType: {
          name: 'serviceType',
          type: 'ServiceType',
          isDataModel: true,
          backLink: 'request',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'serviceTypeId' },
        },
        client: {
          name: 'client',
          type: 'Client',
          isDataModel: true,
          backLink: 'request',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'clientId' },
        },
        document: {
          name: 'document',
          type: 'Document',
          isDataModel: true,
          isArray: true,
          backLink: 'request',
        },
        requestState: {
          name: 'requestState',
          type: 'RequestState',
          isDataModel: true,
          isArray: true,
          backLink: 'request',
        },
        requestAssignment: {
          name: 'requestAssignment',
          type: 'RequestAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'request',
        },
        requirementComplianceTracking: {
          name: 'requirementComplianceTracking',
          type: 'RequirementComplianceTracking',
          isDataModel: true,
          isArray: true,
          backLink: 'request',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    requirementComplianceTracking: {
      name: 'RequirementComplianceTracking',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequirementComplianceTracking$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequirementComplianceTracking$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requirementComplianceTrackings',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        requestId: {
          name: 'requestId',
          type: 'String',
          isForeignKey: true,
          relationField: 'request',
        },
        requirementId: {
          name: 'requirementId',
          type: 'String',
          isForeignKey: true,
          relationField: 'requirement',
        },
        fulfilled: {
          name: 'fulfilled',
          type: 'Boolean',
          attributes: [{ name: '@default', args: [{ value: false }] }],
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          backLink: 'requirementComplianceTracking',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestId' },
        },
        requirement: {
          name: 'requirement',
          type: 'Requirement',
          isDataModel: true,
          backLink: 'requirementComplianceTracking',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requirementId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    document: {
      name: 'Document',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Document$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Document$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'documents',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        status: {
          name: 'status',
          type: 'Int',
        },
        requestId: {
          name: 'requestId',
          type: 'String',
          isForeignKey: true,
          relationField: 'request',
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          backLink: 'document',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    area: {
      name: 'Area',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Area$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Area$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'areas',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          isArray: true,
          backLink: 'area',
        },
        requestAssignment: {
          name: 'requestAssignment',
          type: 'RequestAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'area',
        },
        requestType: {
          name: 'requestType',
          type: 'RequestType',
          isDataModel: true,
          isArray: true,
          backLink: 'area',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    category: {
      name: 'Category',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Category$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Category$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'categories',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        requestTypeId: {
          name: 'requestTypeId',
          type: 'String',
          isForeignKey: true,
          relationField: 'requestType',
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        requestType: {
          name: 'requestType',
          type: 'RequestType',
          isDataModel: true,
          backLink: 'category',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestTypeId' },
        },
        subCategories: {
          name: 'subCategories',
          type: 'SubCategory',
          isDataModel: true,
          isArray: true,
          backLink: 'category',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    subCategory: {
      name: 'SubCategory',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$SubCategory$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$SubCategory$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'subCategories',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        categoryId: {
          name: 'categoryId',
          type: 'String',
          isForeignKey: true,
          relationField: 'category',
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        formId: {
          name: 'formId',
          type: 'Int',
          isOptional: true,
          isForeignKey: true,
          relationField: 'form',
        },
        category: {
          name: 'category',
          type: 'Category',
          isDataModel: true,
          backLink: 'subCategories',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'categoryId' },
        },
        form: {
          name: 'form',
          type: 'Form',
          isDataModel: true,
          isOptional: true,
          backLink: 'SubCategory',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'formId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    requestAssignment: {
      name: 'RequestAssignment',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestAssignment$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestAssignment$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requestAssignments',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        requestId: {
          name: 'requestId',
          type: 'String',
          isForeignKey: true,
          relationField: 'request',
        },
        userId: {
          name: 'userId',
          type: 'String',
          isOptional: true,
          isForeignKey: true,
          relationField: 'user',
        },
        areaId: {
          name: 'areaId',
          type: 'String',
          isOptional: true,
          isForeignKey: true,
          relationField: 'area',
        },
        priority: {
          name: 'priority',
          type: 'String',
          isOptional: true,
        },
        comment: {
          name: 'comment',
          type: 'String',
          isOptional: true,
        },
        assignmentDate: {
          name: 'assignmentDate',
          type: 'DateTime',
        },
        unassignmentDate: {
          name: 'unassignmentDate',
          type: 'DateTime',
          isOptional: true,
        },
        status: {
          name: 'status',
          type: 'String',
        },
        type: {
          name: 'type',
          type: 'String',
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          backLink: 'requestAssignment',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestId' },
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          isOptional: true,
          backLink: 'requestAssignment',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
        area: {
          name: 'area',
          type: 'Area',
          isDataModel: true,
          isOptional: true,
          backLink: 'requestAssignment',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'areaId' },
        },
        documentAssignment: {
          name: 'documentAssignment',
          type: 'DocumentAssignment',
          isDataModel: true,
          isArray: true,
          backLink: 'requestAssignment',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    userRole: {
      name: 'UserRole',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$UserRole$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$UserRole$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'userRoles',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        userId: {
          name: 'userId',
          type: 'String',
          isForeignKey: true,
          relationField: 'user',
        },
        roleId: {
          name: 'roleId',
          type: 'String',
          isForeignKey: true,
          relationField: 'role',
        },
        user: {
          name: 'user',
          type: 'User',
          isDataModel: true,
          backLink: 'userRole',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'userId' },
        },
        role: {
          name: 'role',
          type: 'Role',
          isDataModel: true,
          backLink: 'userRole',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'roleId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    role: {
      name: 'Role',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Role$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Role$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'roles',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        userRole: {
          name: 'userRole',
          type: 'UserRole',
          isDataModel: true,
          isArray: true,
          backLink: 'role',
        },
        rolePermission: {
          name: 'rolePermission',
          type: 'RolePermission',
          isDataModel: true,
          isArray: true,
          backLink: 'role',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    module: {
      name: 'Module',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Module$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Module$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'modules',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        permission: {
          name: 'permission',
          type: 'Permission',
          isDataModel: true,
          isArray: true,
          backLink: 'module',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    permission: {
      name: 'Permission',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Permission$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Permission$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'permissions',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        moduleId: {
          name: 'moduleId',
          type: 'String',
          isForeignKey: true,
          relationField: 'module',
        },
        module: {
          name: 'module',
          type: 'Module',
          isDataModel: true,
          backLink: 'permission',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'moduleId' },
        },
        rolePermission: {
          name: 'rolePermission',
          type: 'RolePermission',
          isDataModel: true,
          isArray: true,
          backLink: 'permission',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    rolePermission: {
      name: 'RolePermission',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RolePermission$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RolePermission$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'rolePermissions',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        roleId: {
          name: 'roleId',
          type: 'String',
          isForeignKey: true,
          relationField: 'role',
        },
        permissionId: {
          name: 'permissionId',
          type: 'String',
          isForeignKey: true,
          relationField: 'permission',
        },
        role: {
          name: 'role',
          type: 'Role',
          isDataModel: true,
          backLink: 'rolePermission',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'roleId' },
        },
        permission: {
          name: 'permission',
          type: 'Permission',
          isDataModel: true,
          backLink: 'rolePermission',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'permissionId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    requestState: {
      name: 'RequestState',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestState$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestState$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requestStates',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        requestId: {
          name: 'requestId',
          type: 'String',
          isForeignKey: true,
          relationField: 'request',
        },
        status: {
          name: 'status',
          type: 'String',
          isOptional: true,
        },
        comment: {
          name: 'comment',
          type: 'String',
          isOptional: true,
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          backLink: 'requestState',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    client: {
      name: 'Client',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Client$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Client$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'clients',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        email: {
          name: 'email',
          type: 'String',
          isOptional: true,
        },
        identificationNumber: {
          name: 'identificationNumber',
          type: 'String',
        },
        corporateName: {
          name: 'corporateName',
          type: 'String',
          isOptional: true,
        },
        monthlyIncome: {
          name: 'monthlyIncome',
          type: 'Float',
          isOptional: true,
        },
        occupation: {
          name: 'occupation',
          type: 'String',
          isOptional: true,
        },
        phone: {
          name: 'phone',
          type: 'String',
          isOptional: true,
        },
        identificationTypeId: {
          name: 'identificationTypeId',
          type: 'String',
          isForeignKey: true,
          relationField: 'identificationType',
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          isArray: true,
          backLink: 'client',
        },
        identificationType: {
          name: 'identificationType',
          type: 'IdentificationType',
          isDataModel: true,
          backLink: 'client',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'identificationTypeId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        email: {
          name: 'email',
          fields: ['email'],
        },
        identificationNumber: {
          name: 'identificationNumber',
          fields: ['identificationNumber'],
        },
      },
    },
    identificationType: {
      name: 'IdentificationType',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$IdentificationType$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$IdentificationType$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'identificationTypes',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        client: {
          name: 'client',
          type: 'Client',
          isDataModel: true,
          isArray: true,
          backLink: 'identificationType',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        name: {
          name: 'name',
          fields: ['name'],
        },
      },
    },
    documentAssignment: {
      name: 'DocumentAssignment',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$DocumentAssignment$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$DocumentAssignment$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'documentAssignments',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        name: {
          name: 'name',
          type: 'String',
          isOptional: true,
        },
        status: {
          name: 'status',
          type: 'String',
          isOptional: true,
        },
        requestAssignmentId: {
          name: 'requestAssignmentId',
          type: 'String',
          isForeignKey: true,
          relationField: 'requestAssignment',
        },
        requestAssignment: {
          name: 'requestAssignment',
          type: 'RequestAssignment',
          isDataModel: true,
          backLink: 'documentAssignment',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'requestAssignmentId' },
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    requestType: {
      name: 'RequestType',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestType$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$RequestType$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'requestTypes',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'String',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
        },
        areaId: {
          name: 'areaId',
          type: 'String',
          isForeignKey: true,
          relationField: 'area',
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          isOptional: true,
        },
        state: {
          name: 'state',
          type: 'Boolean',
          isOptional: true,
        },
        area: {
          name: 'area',
          type: 'Area',
          isDataModel: true,
          backLink: 'requestType',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'areaId' },
        },
        category: {
          name: 'category',
          type: 'Category',
          isDataModel: true,
          isArray: true,
          backLink: 'requestType',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
    form: {
      name: 'Form',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Form$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$Form$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'forms',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'Int',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
          isAutoIncrement: true,
        },
        userId: {
          name: 'userId',
          type: 'String',
        },
        published: {
          name: 'published',
          type: 'Boolean',
          attributes: [{ name: '@default', args: [{ value: false }] }],
        },
        name: {
          name: 'name',
          type: 'String',
        },
        description: {
          name: 'description',
          type: 'String',
          attributes: [{ name: '@default', args: [{ value: '' }] }],
        },
        content: {
          name: 'content',
          type: 'String',
          attributes: [{ name: '@default', args: [{ value: '[]' }] }],
        },
        visits: {
          name: 'visits',
          type: 'Int',
          attributes: [{ name: '@default', args: [{ value: 0 }] }],
        },
        submissions: {
          name: 'submissions',
          type: 'Int',
          attributes: [{ name: '@default', args: [{ value: 0 }] }],
        },
        shareURL: {
          name: 'shareURL',
          type: 'String',
          attributes: [{ name: '@default', args: [] }],
        },
        SubCategory: {
          name: 'SubCategory',
          type: 'SubCategory',
          isDataModel: true,
          isArray: true,
          backLink: 'form',
        },
        FormSubmission: {
          name: 'FormSubmission',
          type: 'FormSubmission',
          isDataModel: true,
          isArray: true,
          backLink: 'form',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
        shareURL: {
          name: 'shareURL',
          fields: ['shareURL'],
        },
        name_userId: {
          name: 'name_userId',
          fields: ['name', 'userId'],
        },
      },
    },
    formSubmission: {
      name: 'FormSubmission',
      fields: {
        createdAt: {
          name: 'createdAt',
          type: 'DateTime',
          attributes: [{ name: '@default', args: [] }],
        },
        updatedAt: {
          name: 'updatedAt',
          type: 'DateTime',
          isOptional: true,
          attributes: [{ name: '@updatedAt', args: [] }],
        },
        deletedAt: {
          name: 'deletedAt',
          type: 'DateTime',
          isOptional: true,
        },
        createdBy: {
          name: 'createdBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$FormSubmission$createdBy,
        },
        modifiedBy: {
          name: 'modifiedBy',
          type: 'String',
          isOptional: true,
          attributes: [{ name: '@default', args: [] }],
          defaultValueProvider: $default$FormSubmission$modifiedBy,
        },
        tenantId: {
          name: 'tenantId',
          type: 'String',
          isForeignKey: true,
          relationField: 'tenant',
        },
        tenant: {
          name: 'tenant',
          type: 'Tenant',
          isDataModel: true,
          backLink: 'formSubmission',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'tenantId' },
        },
        id: {
          name: 'id',
          type: 'Int',
          isId: true,
          attributes: [{ name: '@default', args: [] }],
          isAutoIncrement: true,
        },
        formId: {
          name: 'formId',
          type: 'Int',
          isForeignKey: true,
          relationField: 'form',
        },
        content: {
          name: 'content',
          type: 'String',
        },
        form: {
          name: 'form',
          type: 'Form',
          isDataModel: true,
          backLink: 'FormSubmission',
          isRelationOwner: true,
          foreignKeyMapping: { id: 'formId' },
        },
        request: {
          name: 'request',
          type: 'Request',
          isDataModel: true,
          isArray: true,
          backLink: 'formSubmission',
        },
      },
      uniqueConstraints: {
        id: {
          name: 'id',
          fields: ['id'],
        },
      },
    },
  },
  deleteCascade: {
    user: ['Account', 'Session', 'TwoFactorConfirmation', 'Authenticator'],
  },
  authModel: 'User',
};
function $default$User$createdBy(user: any): unknown {
  return user?.id;
}

function $default$User$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Tenant$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Tenant$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Requirement$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Requirement$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$CategoryRequirement$createdBy(user: any): unknown {
  return user?.id;
}

function $default$CategoryRequirement$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$SalesChannel$createdBy(user: any): unknown {
  return user?.id;
}

function $default$SalesChannel$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$ServiceType$createdBy(user: any): unknown {
  return user?.id;
}

function $default$ServiceType$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RequirementServiceTypeAssociation$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RequirementServiceTypeAssociation$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Request$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Request$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RequirementComplianceTracking$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RequirementComplianceTracking$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Document$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Document$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Area$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Area$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Category$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Category$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$SubCategory$createdBy(user: any): unknown {
  return user?.id;
}

function $default$SubCategory$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RequestAssignment$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RequestAssignment$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$UserRole$createdBy(user: any): unknown {
  return user?.id;
}

function $default$UserRole$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Role$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Role$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Module$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Module$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Permission$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Permission$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RolePermission$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RolePermission$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RequestState$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RequestState$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Client$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Client$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$IdentificationType$createdBy(user: any): unknown {
  return user?.id;
}

function $default$IdentificationType$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$DocumentAssignment$createdBy(user: any): unknown {
  return user?.id;
}

function $default$DocumentAssignment$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$RequestType$createdBy(user: any): unknown {
  return user?.id;
}

function $default$RequestType$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$Form$createdBy(user: any): unknown {
  return user?.id;
}

function $default$Form$modifiedBy(user: any): unknown {
  return user?.id;
}

function $default$FormSubmission$createdBy(user: any): unknown {
  return user?.id;
}

function $default$FormSubmission$modifiedBy(user: any): unknown {
  return user?.id;
}
export default metadata;
