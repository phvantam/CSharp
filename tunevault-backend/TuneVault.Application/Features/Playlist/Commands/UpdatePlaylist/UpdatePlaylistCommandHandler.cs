using MediatR;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Commands.UpdatePlaylist;

public class UpdatePlaylistCommandHandler : IRequestHandler<UpdatePlaylistCommand, bool>
{
    private readonly IPlaylistService _playlistService;

    public UpdatePlaylistCommandHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<bool> Handle(
        UpdatePlaylistCommand command,
        CancellationToken cancellationToken)
    {
        var request = new UpdatePlaylistRequestDto
        {
            Name = command.Request.Name,
            Description = command.Request.Description,
            Visibility = command.Request.Visibility,

            // Quan trọng: giữ lại đường dẫn ảnh bìa mới được tạo ở PlaylistController.
            // Nếu thiếu dòng này, ảnh chỉ preview tạm trên frontend,
            // logout/login lại sẽ quay về ảnh cũ vì DB không được cập nhật.
            CoverImageUrl = command.Request.CoverImageUrl
        };

        return await _playlistService.UpdatePlaylistAsync(
            command.PlaylistId,
            command.UserId,
            request
        );
    }
}
