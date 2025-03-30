
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthorization } from '@/context/AuthorizationContext';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function CollegeAdminPage() {
  return (
    <ProtectedRoute requiredRole="college_admin" requiredPermission="verify_students">
      <CollegeAdminContent />
    </ProtectedRoute>
  );
}

function CollegeAdminContent() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          name, 
          email,
          user_verifications(is_verified)
        `)
        .eq('role', 'student');

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const generateVerificationCode = async () => {
    setGenerating(true);
    try {
      // Generate a random 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Store the code in the database
      const { error } = await supabase
        .from('college_verification_codes')
        .insert({
          college_id: user?.id, // Assuming college_id is the admin's user ID
          code,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });
        
      if (error) throw error;
      
      setVerificationCode(code);
      toast.success('Verification code generated successfully');
    } catch (error) {
      console.error('Error generating verification code:', error);
      toast.error('Failed to generate verification code');
    } finally {
      setGenerating(false);
    }
  };

  const verifyStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('user_verifications')
        .upsert({
          user_id: studentId,
          college_id: user?.id, // Assuming college_id is the admin's user ID
          is_verified: true,
          verified_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Student verified successfully');
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error verifying student:', error);
      toast.error('Failed to verify student');
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">College Administration</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verification Code</CardTitle>
            <CardDescription>
              Generate a verification code to share with your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationCode ? (
              <div className="bg-muted p-4 rounded-md text-center">
                <p className="text-sm text-muted-foreground mb-2">Verification Code:</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{verificationCode}</p>
                <p className="text-xs text-muted-foreground mt-2">Valid for 24 hours</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No active verification code. Generate a new one to share with your students.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generateVerificationCode} 
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate New Code'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              View and manage student verifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const isVerified = student.user_verifications && 
                                      student.user_verifications.length > 0 && 
                                      student.user_verifications[0].is_verified;
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!isVerified && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => verifyStudent(student.id)}
                            >
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No students found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
