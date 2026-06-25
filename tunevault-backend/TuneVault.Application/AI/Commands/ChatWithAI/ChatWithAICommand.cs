using MediatR;

namespace TuneVault.Application.AI.Commands.ChatWithAI;

public record ChatWithAICommand(string UserMessage) : IRequest<string>;