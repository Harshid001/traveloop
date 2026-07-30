/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful (sets httpOnly cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       423:
 *         description: Account locked after 5 failed attempts (15 min)
 *
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (clears httpOnly cookie)
 *     security: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset email sent if account exists
 *
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     security: []
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *
 * /api/auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email with token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login via Google OAuth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string, description: Google ID token from OAuth flow }
 *     responses:
 *       200:
 *         description: Google login successful
 *
 * /api/trips:
 *   get:
 *     tags: [Trips]
 *     summary: List all trips for authenticated user
 *     responses:
 *       200:
 *         description: Array of trips
 *   post:
 *     tags: [Trips]
 *     summary: Create a new trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TripRequest'
 *     responses:
 *       201:
 *         description: Trip created
 *
 * /api/trips/upcoming:
 *   get:
 *     tags: [Trips]
 *     summary: Get upcoming trips
 *     responses:
 *       200:
 *         description: Array of upcoming trips
 *
 * /api/trips/recent:
 *   get:
 *     tags: [Trips]
 *     summary: Get recent trips
 *     responses:
 *       200:
 *         description: Array of recent trips
 *
 * /api/trips/share/{shareId}:
 *   get:
 *     tags: [Trips]
 *     summary: View a shared trip (no auth required)
 *     security: []
 *     parameters:
 *       - name: shareId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shared trip details
 *
 * /api/trips/{id}:
 *   get:
 *     tags: [Trips]
 *     summary: Get trip by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trip details
 *   put:
 *     tags: [Trips]
 *     summary: Update trip
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trip updated
 *   delete:
 *     tags: [Trips]
 *     summary: Delete trip
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Trip deleted
 *
 * /api/trips/{tripId}/itinerary:
 *   get:
 *     tags: [Trips]
 *     summary: Get trip itinerary
 *     parameters:
 *       - name: tripId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Itinerary data
 *   post:
 *     tags: [Trips]
 *     summary: Create/update itinerary
 *     parameters:
 *       - name: tripId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Itinerary saved
 *
 * /api/trips/{tripId}/budget:
 *   get:
 *     tags: [Trips]
 *     summary: Get trip budget
 *     parameters:
 *       - name: tripId
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Budget data
 *
 * /api/discover/trending:
 *   get:
 *     tags: [Discover]
 *     summary: Get trending destinations
 *     security: []
 *     responses:
 *       200:
 *         description: Array of trending destinations
 *
 * /api/discover/seasonal:
 *   get:
 *     tags: [Discover]
 *     summary: Get seasonal destinations
 *     security: []
 *     parameters:
 *       - name: month
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - name: hemisphere
 *         in: query
 *         schema: { type: string, enum: [northern, southern] }
 *     responses:
 *       200:
 *         description: Seasonal destinations
 *
 * /api/discover/budget:
 *   get:
 *     tags: [Discover]
 *     summary: Find destinations by budget range
 *     security: []
 *     parameters:
 *       - name: min
 *         in: query
 *         schema: { type: number }
 *       - name: max
 *         in: query
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Budget-friendly destinations
 *
 * /api/discover/category/{category}:
 *   get:
 *     tags: [Discover]
 *     summary: Browse destinations by category
 *     security: []
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         schema: { type: string, enum: [beach, mountain, city, cultural, historical, island, adventure, luxury] }
 *     responses:
 *       200:
 *         description: Category destinations
 *
 * /api/discover/nearby:
 *   get:
 *     tags: [Discover]
 *     summary: Find nearby destinations
 *     security: []
 *     parameters:
 *       - name: lat
 *         in: query
 *         required: true
 *         schema: { type: number }
 *       - name: lng
 *         in: query
 *         required: true
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Nearby destinations
 *
 * /api/discover/recommended:
 *   get:
 *     tags: [Discover]
 *     summary: Get personalized recommendations
 *     responses:
 *       200:
 *         description: Recommended destinations
 *
 * /api/discover/search:
 *   get:
 *     tags: [Discover]
 *     summary: Smart search destinations
 *     security: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Search results
 *
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 *     responses:
 *       200:
 *         description: Server is running
 */
module.exports = {};