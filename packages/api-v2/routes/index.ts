import {Request, Response, Router} from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: "Racing Laptime Application",
    authors: ["Lars", "Mathijs"],
    message: 'Successfully connected'
  });
});

export default router;