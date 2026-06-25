namespace TuneVault.Application.Interfaces;

public interface IAuthorizableRequest
{
    string ResourceOwnerId { get; }
    string ResourceType { get; }
}