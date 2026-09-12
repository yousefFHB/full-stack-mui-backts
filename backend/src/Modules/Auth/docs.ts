/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     PhoneNumber:
 *       type: object
 *       required:
 *         - phoneNumber
 *       properties:
 *         phoneNumber:
 *           type: string
 *           example: "09121234567"
 *
 *     LoginWithOtp:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - code
 *       properties:
 *         phoneNumber:
 *           type: string
 *           example: "09121234567"
 *         code:
 *           type: string
 *           example: "12345"
 *
 *     LoginWithPassword:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - password
 *       properties:
 *         phoneNumber:
 *           type: string
 *           example: "09121234567"
 *         password:
 *           type: string
 *           example: "Password123"
 *
 *     ForgetPassword:
 *       type: object
 *       required:
 *         - phoneNumber
 *         - code
 *         - newPassword
 *       properties:
 *         phoneNumber:
 *           type: string
 *           example: "09121234567"
 *         code:
 *           type: string
 *           example: "12345"
 *         newPassword:
 *           type: string
 *           example: "NewPassword123"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successfully
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a1f2c3b4e5d6f7a8b9c0d1"
 *         phoneNumber:
 *           type: string
 *           example: "09121234567"
 *         fullName:
 *           type: string
 *           example: "Yousef Farahbakhsh"
 *         isActive:
 *           type: boolean
 *           example: true
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *         avatar:
 *           type: array
 *           items:
 *             type: string
 *         role:
 *           type: string
 *           example: "64a1f2c3b4e5d6f7a8b9c0d2"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Start authentication
 *     description: |
 *       Checks whether the user exists.
 *
 *       - If the user does **not** have a password, an OTP is sent to the phone number.
 *       - If the user already **has** a password, the client should redirect to the password login endpoint.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneNumber'
 *     responses:
 *       200:
 *         description: Authentication started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP code sent successfully!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userExist:
 *                       type: boolean
 *                       example: false
 *                     hasPassword:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Failed to send OTP or validation error
 *       403:
 *         description: Account is inactive
 *       422:
 *         description: Validation error — invalid phone number
 */

/**
 * @swagger
 * /api/auth/resend-code:
 *   post:
 *     summary: Resend OTP code
 *     description: Resends a new OTP code to the provided phone number.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneNumber'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "OTP code sent successfully!"
 *       400:
 *         description: Failed to send OTP
 *       422:
 *         description: Validation error — invalid phone number
 */

/**
 * @swagger
 * /api/auth/login-with-otp:
 *   post:
 *     summary: Login using OTP
 *     description: |
 *       Verifies the OTP code and logs the user in.
 *       If no user exists for the given phone number, a new account is created automatically.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginWithOtp'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid or expired OTP
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/login-with-password:
 *   post:
 *     summary: Login using password
 *     description: Authenticates an existing user using their phone number and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginWithPassword'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Reset password using OTP
 *     description: |
 *       Verifies the OTP code and sets a new password for the user.
 *
 *       Password requirements:
 *       - Minimum 8 characters
 *       - At least one uppercase letter
 *       - At least one lowercase letter
 *       - At least one number
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgetPassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "رمز عبور با موفقیت تغییر یافت"
 *       400:
 *         description: Invalid OTP or weak password
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation error
 */

export {};
