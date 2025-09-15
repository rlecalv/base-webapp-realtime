import * as jwt from 'jsonwebtoken';
import { User } from '../models';
import config from '../config';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: number };
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Utilisateur non trouvé ou inactif' 
      });
    }

    req.user = user as any;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ 
      error: 'Token invalide' 
    });
  }
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ 
      error: 'Accès administrateur requis' 
    });
  }
  next();
};

export { authenticateToken, requireAdmin };
export default authenticateToken;