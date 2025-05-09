import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        name: "Sero API",
        version: "2.0.0",
        authors: ["Mathijs"],
        message: 'Successfully connected',
        documentation: '/docs'
    });
});

export default router;