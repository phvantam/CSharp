using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands;

public record DeletePlaylistCommand(Guid PlaylistId, string UserId) : IRequest;

public class DeletePlaylistCommandHandler : IRequestHandler<DeletePlaylistCommand>
{
    private readonly IPlaylistRepository _playlistRepository;

    public DeletePlaylistCommandHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId)
            ?? throw new KeyNotFoundException("Playlist not found");

        // Authorization: chỉ owner mới được xóa
        if (playlist.OwnerUserId != Guid.Parse(request.UserId))
            throw new UnauthorizedAccessException("You do not own this playlist");

        await _playlistRepository.DeleteAsync(request.PlaylistId);
    }
}