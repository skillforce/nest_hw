export class NewestLikeViewDto {
  userId: string;
  login: string;
  addedAt: string;

  static mapToViewDto(likeDto: {
    userId: number;
    login: string;
    addedAt: Date;
  }): NewestLikeViewDto {
    return {
      userId: likeDto.userId.toString(),
      login: likeDto.login,
      addedAt: likeDto.addedAt.toISOString(),
    };
  }
}
