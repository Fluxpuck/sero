import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        name: "Sero API",
        version: "2.0.0",
        authors: ["Fluxpuck"],
        message: 'Successfully connected',
    });
});

export default router;