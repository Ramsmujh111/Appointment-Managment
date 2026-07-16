import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();


// this router is use for the authentication of the user

router.post('/register', register);
router.post('/login', login);

export default router;
