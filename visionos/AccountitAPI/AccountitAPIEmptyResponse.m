#import <AccountitAPI/AccountitAPIEmptyResponse.h>

@implementation AccountitAPIEmptyResponse

- (BOOL)ok {
    return [self boolForKey:@"ok" defaultValue:YES];
}

@end
