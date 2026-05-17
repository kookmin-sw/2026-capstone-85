#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPAAiSuggestionListResponseTests : XCTestCase
@end

@implementation AccountitAPICPAAiSuggestionListResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPAAiSuggestionListResponse class]];
}

@end
