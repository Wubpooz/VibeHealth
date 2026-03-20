import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';

const medicalIdRoutes = new Hono();

// Get medical ID for current user
medicalIdRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');
  
  try {
    const medicalId = await prisma.medicalId.findUnique({
      where: { userId: user.id }
    });
    
    if (!medicalId) {
      // Try to build from profile
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
      });
      
      if (profile) {
        // Return profile-derived data
        const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
        const age = dob ? calculateAge(dob) : 0;
        
        return c.json({
          medicalId: {
            name: user.name || '',
            dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0] || '',
            age,
            bloodType: null,
            allergies: profile.allergies || [],
            medications: profile.currentMedications || [],
            medicalConditions: profile.medicalConditions || [],
            emergencyContacts: [],
            lastUpdated: new Date()
          }
        });
      }
      
      return c.json({ medicalId: null });
    }
    
    // Calculate age from profile DOB
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
    
    const dob = profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null;
    const age = dob ? calculateAge(dob) : 0;
    
    return c.json({
      medicalId: {
        name: user.name || '',
        dateOfBirth: profile?.dateOfBirth?.toISOString().split('T')[0] || '',
        age,
        bloodType: medicalId.bloodType,
        allergies: medicalId.allergies || [],
        medications: medicalId.medications || [],
        medicalConditions: profile?.medicalConditions || [],
        emergencyContacts: medicalId.emergencyContacts || [],
        qrCode: medicalId.qrCode,
        lastUpdated: medicalId.updatedAt
      }
    });
  } catch (error) {
    console.error('Failed to fetch medical ID:', error);
    return c.json({ error: 'Failed to fetch medical ID' }, 500);
  }
});

// Create or update medical ID
medicalIdRoutes.post('/', requireAuth, async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  
  try {
    const { bloodType, allergies, medications, emergencyContacts, medicalNotes, organDonor } = body;
    
    // Generate QR code data
    const qrData = JSON.stringify({
      n: user.name,
      bt: bloodType,
      a: (allergies || []).slice(0, 5),
      m: (medications || []).slice(0, 5),
      ec: (emergencyContacts || []).slice(0, 2).map((c: any) => ({
        n: c.name,
        p: c.phone
      }))
    });
    
    const medicalId = await prisma.medicalId.upsert({
      where: { userId: user.id },
      update: {
        bloodType,
        allergies: allergies || [],
        medications: medications || [],
        emergencyContacts: emergencyContacts || [],
        qrCode: qrData,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        bloodType,
        allergies: allergies || [],
        medications: medications || [],
        emergencyContacts: emergencyContacts || [],
        qrCode: qrData
      }
    });
    
    // Get profile for full response
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });
    
    const dob = profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null;
    const age = dob ? calculateAge(dob) : 0;
    
    return c.json({
      medicalId: {
        name: user.name || '',
        dateOfBirth: profile?.dateOfBirth?.toISOString().split('T')[0] || '',
        age,
        bloodType: medicalId.bloodType,
        allergies: medicalId.allergies,
        medications: medicalId.medications,
        medicalConditions: profile?.medicalConditions || [],
        emergencyContacts: medicalId.emergencyContacts,
        qrCode: medicalId.qrCode,
        lastUpdated: medicalId.updatedAt
      }
    });
  } catch (error) {
    console.error('Failed to save medical ID:', error);
    return c.json({ error: 'Failed to save medical ID' }, 500);
  }
});

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export { medicalIdRoutes };
