import { Team } from '../../domain/entities/team.entity';
import { TeamMember } from '../../domain/entities/team-member.entity';
import { MemberProfileSnapshot } from '../../domain/value-objects/member-profile-snapshot.vo';
import { TeamResponseDto } from '../dtos/team-response.dto';

function profileToResponse(
  memberId: string,
  profile: MemberProfileSnapshot,
): TeamResponseDto['members'][0]['profile'] {
  return {
    id: memberId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    fullName: profile.fullName,
    email: profile.email.value,
    title: profile.title,
    position: profile.title,
    yearsExperience: profile.yearsExperience,
    availability: profile.availability.status,
    education: profile.education,
    summary: profile.summary,
    cvFilePath: profile.cvFilePath,
    profilePhotoUrl: profile.profilePhotoUrl,
    keySkills: profile.keySkills,
    businessSkills: profile.businessSkills,
    technologySkills: profile.technologySkills,
    languages: profile.languages.map((l) => ({
      language: l.language,
      level: l.level,
    })),
    industryExperience: profile.industryExperience,
    certificates: profile.certificates,
    selectedClients: profile.selectedClients,
    skills: profile.skills.map((s) => ({
      name: s.name,
      category: s.category,
      level: s.level,
      yearsUsed: s.yearsUsed,
    })),
    projects: profile.projects.map((p) => ({
      name: p.name,
      description: p.description,
      technologies: p.technologies,
    })),
  };
}

function memberToResponse(member: TeamMember): TeamResponseDto['members'][0] {
  return {
    id: member.teamMemberId.toString(),
    sourceCandidateId: member.sourceCandidateId,
    candidateId: member.sourceCandidateId,
    role: member.role.value,
    isLead: member.isLead,
    joinedAt: member.joinedAt.toISOString(),
    profile: profileToResponse(member.teamMemberId.toString(), member.profile),
  };
}

export class TeamMapper {
  static toResponse(team: Team): TeamResponseDto {
    return {
      id: team.teamId.toString(),
      name: team.name,
      description: team.description,
      status: team.status,
      members: team.members.map(memberToResponse),
    };
  }
}
